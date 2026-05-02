import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { getStoreById } from '@/lib/tenant/get-store'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Wallet, ArrowRight, Building2, User, MapPin, Phone, MessageSquare, AlertTriangle } from 'lucide-react'
import InvoiceActions from '@/components/InvoiceActions'
import CopyableText from '@/components/CopyableText'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
   const { id } = await params
   return { title: `فاتورة طلب #${id.split('-')[0].toUpperCase()}` }
}

export default async function InvoicePage({
   params,
   searchParams,
}: {
   params: Promise<{ id: string }>
   searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
   const { id } = await params
   const { token } = await searchParams
   const supabase = await createClient()

   let order: any = null
   let items: any[] = []
   let storeBranding: any = null
   let storeSettings: any = null
   let storeInfo: any = null

   // 1. Check if there's a logged-in user (Merchant)
   const { data: { user } } = await supabase.auth.getUser()

   console.log(`[Invoice] Access Attempt - ID: ${id}, Token: ${token}, User: ${user?.id || 'GUEST'}`)

   // 2. Fetch Order + Items + Store Config in one go using RPC v2
   // We pass the token if available. If not, the RPC will check auth.uid()
   let { data: rows, error: rpcError } = await supabase.rpc('get_order_invoice_v2', {
      p_order_id: id,
      p_token: (token && typeof token === 'string' && token !== 'null') ? token : null,
   })

   // 3. Fallback: If no data but user is logged in, try with Admin Client directly without RPC
   if ((!rows || rows.length === 0) && user) {
      console.log('[Invoice] RPC returned empty for merchant, falling back to manual Admin fetch...')
      const { createAdminClient } = await import('@/lib/supabase/server')
      const adminSupabase = createAdminClient()

      // Fetch order directly (admin bypasses RLS)
      const { data: adminOrder } = await adminSupabase.from('orders').select('*').eq('id', id).single()

      if (adminOrder) {
         // Fetch items
         const { data: adminItems } = await adminSupabase.from('order_items').select('*').eq('order_id', id)

         // Fetch store info
         const { data: store } = await adminSupabase.from('stores').select('*').eq('id', adminOrder.store_id).single()
         const { data: branding } = await adminSupabase.from('store_branding').select('*').eq('store_id', adminOrder.store_id).single()
         const { data: settings } = await adminSupabase.from('store_settings').select('*').eq('store_id', adminOrder.store_id).single()

         // Manually construct the row object exactly as the RPC would
         if (store) {
            rows = [{
               id: adminOrder.id,
               created_at: adminOrder.created_at,
               status: adminOrder.status,
               product_name: adminOrder.product_name,
               product_price: adminOrder.product_price,
               coupon_code: adminOrder.coupon_code,
               discount_percentage: adminOrder.discount_percentage,
               final_price: adminOrder.final_price,
               customer_name: adminOrder.customer_name,
               customer_phone: adminOrder.customer_phone,
               customer_address: adminOrder.customer_address,
               payment_method: adminOrder.payment_method,
               store_id: adminOrder.store_id,
               items: adminItems || [],
               store_name: store.name,
               store_slug: store.slug,
               whatsapp: store.whatsapp_phone,
               plan: store.plan,
               logo_url: branding?.logo_url,
               tagline: branding?.tagline,
               primary_color: branding?.primary_color,
               instapay: branding?.invoice_instapay,
               wallet: branding?.invoice_wallet,
               cod_deposit_required: settings?.cod_deposit_required,
               deposit_percentage: settings?.deposit_percentage,
               policies: settings?.policies
            }]
            rpcError = null
         }
      }
   }

   if (rpcError || !rows || rows.length === 0) {
      console.error('Invoice RPC Error:', rpcError)
      return <InvalidInvoiceLink />
   }

   const row = rows[0]
   order = row
   items = row.items || []
   storeInfo = {
      id: row.store_id,
      name: row.store_name,
      slug: row.store_slug,
      whatsapp_phone: row.whatsapp,
      plan: row.store_plan || row.plan
   }
   storeBranding = {
      primary_color: row.primary_color,
      logo_url: row.logo_url,
      tagline: row.tagline,
      invoice_instapay: row.instapay,
      invoice_wallet: row.wallet
   }
   storeSettings = {
      cod_deposit_required: row.cod_deposit_required,
      deposit_percentage: row.deposit_percentage,
      policies: row.policies
   }

   // --- Plan Enforcement ---
   const { getPlanConfig, getDynamicPlanConfigs } = await import('@/lib/subscription')
   const plan = (storeInfo?.plan as any || 'starter') as import('@/lib/subscription').PlanTier
   const dynamicConfigs = await getDynamicPlanConfigs(supabase)
   const config = dynamicConfigs[plan] || getPlanConfig(plan)

   const storeName = storeInfo?.name ?? 'متجرنا'
   const storeBackHref = storeInfo?.slug ? `/store/${storeInfo.slug}` : '/'

   const finalPrice = Number(order.final_price)
   const discountPct = Number(order.discount_pct || order.discount_percentage || 0)
   const productPrice = Number(order.product_price)
   const depositAmount = storeSettings?.cod_deposit_required ? (finalPrice * (storeSettings.deposit_percentage || 50)) / 100 : 0

   const shortId = id.split('-')[0].toUpperCase()
   const primaryColor = storeBranding?.primary_color || '#0ea5e9'

   // --- WhatsApp Message Logic ---
   const headersList = await headers()
   const host = headersList.get('host') || 'kayamarket.com'
   const protocol = host.includes('localhost') ? 'http' : 'https'
   const invoiceLink = `${protocol}://${host}/invoice/${id}${token ? `?token=${token}` : ''}`

   const isPremiumWhatsapp = config.hasProfessionalWhatsapp

   let waMessage = ''
   if (isPremiumWhatsapp) {
      const itemsList = items && items.length > 0
         ? items.map((i: any) => `• ${i.product_name} (${i.quantity}x)`).join('\n')
         : `• ${order.product_name}`

      waMessage = [
         `مرحباً، أود تأكيد طلبي الجديد من متجركم (${storeName})!`,
         '',
         `تفاصيل العميل:`,
         `الاسم: ${order.customer_name}`,
         `رقم الهاتف: ${order.customer_phone}`,
         `عنوان التوصيل: ${order.customer_address}`,
         '',
         `تفاصيل الطلب:`,
         `وقت الطلب: ${new Date(order.created_at).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}`,
         '',
         `المنتجات:`,
         itemsList,
         '',
         `الإجمالي: ${finalPrice.toLocaleString('en-US')} ج.م`,
         '',
         `رابط الفاتورة:`,
         invoiceLink,
         '',
         `شكراً لكم!`
      ].join('\n').normalize('NFC')
   } else {
      waMessage = [
         `مرحباً، لقد قمت بإنشاء طلب جديد!`,
         `رقم الطلب: #${shortId}`,
         `رابط الفاتورة: ${invoiceLink}`
      ].join('\n').normalize('NFC')
   }

   let cleanPhone = storeInfo?.whatsapp_phone ? storeInfo.whatsapp_phone.replace(/\D/g, '') : ''
   if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = '2' + cleanPhone
   }

   const whatsappUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`
      : null

   return (
      <div className="min-h-screen bg-zinc-50 font-inter" dir="rtl" style={{ '--store-primary': primaryColor } as any}>

         {/* ── Navbar ─────────────────────────────────────────────────────────── */}
         <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200 no-print">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
               <Link href={storeBackHref} className="flex items-center gap-3">
                  {storeBranding?.logo_url && (
                     <div className="h-9 w-9 rounded-xl flex items-center justify-center font-black shadow-lg overflow-hidden" style={{ background: 'var(--store-primary)', boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--store-primary), transparent 80%)' }}>
                        <img src={storeBranding.logo_url} className="w-full h-full object-cover" />
                     </div>
                  )}
                  <span className="text-lg font-black" style={{ color: primaryColor }}>{storeName}</span>
               </Link>
               <Link href={storeBackHref} className="text-xs font-black text-zinc-500 hover:text-zinc-900 flex items-center gap-1">
                  العودة للمتجر <ArrowRight className="h-4 w-4 rotate-180" />
               </Link>
            </div>
         </header>

         <main className="mx-auto max-w-4xl px-6 py-10 print:p-0">

            {/* ── Success Alert ────────────────────────────────────────────── */}
            <div className="mb-8 p-6 md:p-8 bg-emerald-50 rounded-[2rem] md:rounded-[2.5rem] border-2 border-emerald-100 flex flex-col items-center justify-center text-center gap-6 no-print">
               <div className="flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                     <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                     <h2 className="text-xl md:text-2xl font-black text-emerald-900">تم استلام طلبك بنجاح!</h2>
                  </div>
               </div>
               <div className="flex flex-col items-center justify-center gap-4 w-full">
                  <InvoiceActions order={order} hasPdfInvoice={config.hasPdfInvoice} storeName={storeName} whatsappUrl={whatsappUrl} primaryColor={primaryColor} />
               </div>
            </div>

            {/* ── Invoice Card ─────────────────────────────────────────────────── */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">

               <div className="p-8 md:p-12 border-b-2 border-dashed border-zinc-100 flex flex-col items-center gap-10 text-center">
                  <div className="flex flex-col items-center gap-4">
                     {storeBranding?.logo_url && (
                        <div className="h-28 w-28 relative rounded-[2.5rem] overflow-hidden border-2 border-zinc-50 shadow-xl shadow-zinc-200/50 shrink-0">
                           <img src={storeBranding.logo_url} alt={storeName} className="object-cover w-full h-full" />
                        </div>
                     )}
                     <div>
                        <h1 className="text-4xl font-black text-zinc-900 mb-2 tracking-tight">{storeName}</h1>
                        <p className="text-base font-bold text-zinc-400 max-w-sm">{storeBranding?.tagline || 'شكراً لتعاملكم معنا'}</p>
                     </div>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-4 border-t border-zinc-50 pt-10">
                     <div className="flex flex-col items-start text-right">
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-1.5">رقم الفاتورة</span>
                        <span className="text-xl md:text-2xl font-black text-zinc-900" dir="ltr">#{shortId}</span>
                     </div>
                     <div className="flex flex-col items-end text-left">
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-1.5">تاريخ الإصدار</span>
                        <span className="text-sm md:text-base font-black text-zinc-900">{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                     </div>
                  </div>
               </div>

               <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--store-primary)' }} />
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">بيانات العميل</h3>
                     </div>
                     <div className="grid gap-6">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                              <User className="h-5 w-5" />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-zinc-400 mb-0.5">الاسم الكامل</p>
                              <p className="text-sm font-black text-zinc-900">{order.customer_name}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                              <Phone className="h-5 w-5" />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-zinc-400 mb-0.5">رقم الهاتف</p>
                              <p className="text-sm font-black text-zinc-900" dir="ltr">{order.customer_phone}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                              <MapPin className="h-5 w-5" />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-zinc-400 mb-0.5">عنوان التوصيل</p>
                              <p className="text-sm font-black text-zinc-900">{order.customer_address}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--store-primary)' }} />
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">تفاصيل الطلب</h3>
                     </div>
                     <div className="bg-zinc-50 rounded-3xl p-8 space-y-4">
                        <div className="space-y-4 mb-6">
                           {items && items.length > 0 ? (
                              items.map((item: any) => (
                                 <div key={item.id} className="flex justify-between items-center text-sm font-bold">
                                    <div className="flex gap-2 items-center">
                                       <span className="text-zinc-400">{item.quantity}x</span>
                                       <span className="text-zinc-900">{item.product_name}</span>
                                    </div>
                                    <span className="text-zinc-600">{(Number(item.product_price) * item.quantity).toLocaleString()} ج.م</span>
                                 </div>
                              ))
                           ) : (
                              <div className="flex justify-between items-center text-sm font-bold">
                                 <span className="text-zinc-900">{order.product_name}</span>
                                 <span className="text-zinc-600">{Number(order.product_price).toLocaleString()} ج.م</span>
                              </div>
                           )}
                        </div>

                        <div className="h-px bg-zinc-200/50 my-2" />

                        <div className="space-y-3">
                           <div className="flex justify-between text-xs font-bold text-zinc-500">
                              <span>المجموع الفرعي</span>
                              <span>{productPrice.toLocaleString()} ج.م</span>
                           </div>
                           {discountPct > 0 && (
                              <div className="flex justify-between text-xs font-bold text-emerald-600">
                                 <span>خصم ({order.coupon_code || discountPct + '%'})</span>
                                 <span dir="ltr">-{((productPrice * discountPct) / 100).toLocaleString()} ج.م</span>
                              </div>
                           )}
                        </div>

                        <div className="h-px bg-zinc-200/50 my-2" />
                        <div className="flex justify-between items-center">
                           <span className="text-lg font-black text-zinc-900">الإجمالي</span>
                           <span className="text-3xl font-black" style={{ color: 'var(--store-primary)' }}>{finalPrice.toLocaleString()} <span className="text-xs mr-1">ج.م</span></span>
                        </div>

                        {depositAmount > 0 && order.payment_method === 'الدفع عند الاستلام' && (
                           <div className="mt-6 p-5 bg-amber-100/50 rounded-2xl border border-amber-200 border-dashed text-center">
                              <p className="text-[10px] font-black text-amber-600 uppercase mb-1">مطلوب دفع عربون الآن</p>
                              <p className="text-2xl font-black text-amber-900">{depositAmount.toLocaleString()} ج.م</p>
                              <div className="mt-2 text-[10px] font-bold text-amber-700/60">الباقي عند الاستلام: {(finalPrice - depositAmount).toLocaleString()} ج.م</div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               <div className="px-8 md:px-12 pb-12">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--store-primary)' }} />
                     <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">طرق الدفع والتحويل</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-6 rounded-[2rem] border-2 border-zinc-50 bg-zinc-50/30 flex flex-col items-center text-center group hover:border-[var(--store-primary)]/30 transition-all">
                        <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ color: 'var(--store-primary)' }}>
                           <Building2 className="h-7 w-7" />
                        </div>
                        <p className="text-sm font-black text-zinc-900 mb-2">إنستا باي (InstaPay)</p>
                        <CopyableText text={storeBranding?.invoice_instapay || 'غير متوفر'} label="اضغط للنسخ" />
                     </div>
                     <div className="p-6 rounded-[2rem] border-2 border-zinc-50 bg-zinc-50/30 flex flex-col items-center text-center group hover:border-[var(--store-primary)]/30 transition-all">
                        <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ color: 'var(--store-primary)' }}>
                           <Wallet className="h-7 w-7" />
                        </div>
                        <p className="text-sm font-black text-zinc-900 mb-2">محفظة إلكترونية</p>
                        <CopyableText text={storeBranding?.invoice_wallet || 'غير متوفر'} label="اضغط للنسخ" />
                     </div>
                  </div>
               </div>

               <div className="bg-zinc-900 p-12 text-center text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ background: 'var(--store-primary)' }} />
                  <div className="relative z-10">
                     <p className="text-sm font-black mb-4">شكراً لتسوقكم من {storeName}</p>
                     <div className="flex items-center justify-center gap-6">
                        {whatsappUrl && (
                           <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                              <MessageSquare className="h-4 w-4" />
                              تواصل عبر واتساب
                           </a>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {storeSettings?.policies && (
               <div className="mt-12 text-center max-w-2xl mx-auto px-6">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-4">سياسات المتجر</p>
                  <p className="text-xs font-bold text-zinc-400 leading-relaxed whitespace-pre-line">{storeSettings.policies}</p>
               </div>
            )}
         </main>

         <footer className="mt-auto py-10 text-center no-print">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Powered by KayaMarket</p>
         </footer>
      </div>
   )
}

function InvalidInvoiceLink() {
   return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-center p-6" dir="rtl">
         <div className="max-w-md space-y-8">
            <div className="mx-auto h-24 w-24 rounded-full bg-red-50 flex items-center justify-center text-red-500">
               <AlertTriangle className="h-12 w-12" />
            </div>
            <div className="space-y-4">
               <h1 className="text-3xl font-black text-zinc-900">الفاتورة غير متوفرة</h1>
               <p className="text-sm font-bold text-zinc-500 leading-relaxed">
                  عذراً، هذا الرابط غير صالح أو قد يكون قد مضى عليه أكثر من 90 يوماً. يرجى التواصل مع المتجر للحصول على نسخة جديدة.
               </p>
            </div>
            <Link href="/" className="inline-flex items-center gap-3 bg-zinc-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-zinc-200">
               <ArrowRight className="h-5 w-5" />
               العودة للرئيسية
            </Link>
         </div>
      </div>
   )
}
