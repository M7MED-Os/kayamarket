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

   // 2. Fetch Order + Items + Store Config in one go using RPC v2
   let { data: rows, error: rpcError } = await supabase.rpc('get_order_invoice_v2', {
      p_order_id: id,
      p_token: (token && typeof token === 'string' && token !== 'null') ? token : null,
   })

   // 3. Fallback for Merchant view
   if ((!rows || rows.length === 0) && user) {
      const { createAdminClient } = await import('@/lib/supabase/server')
      const adminSupabase = createAdminClient()
      const { data: adminOrder } = await adminSupabase.from('orders').select('*').eq('id', id).single()

      if (adminOrder) {
         const { data: adminItems } = await adminSupabase.from('order_items').select('*').eq('order_id', id)
         const { data: store } = await adminSupabase.from('stores').select('*').eq('id', adminOrder.store_id).single()
         const { data: branding } = await adminSupabase.from('store_branding').select('*').eq('store_id', adminOrder.store_id).single()
         const { data: settings } = await adminSupabase.from('store_settings').select('*').eq('store_id', adminOrder.store_id).single()

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
               selected_theme: branding?.selected_theme,
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
         `وقت الطلب: ${new Date(order.created_at).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo', dateStyle: 'medium', timeStyle: 'short' })}`,
         `طريقة الدفع: ${order.payment_method}`,
         order.coupon_code ? `🎟️ الكوبون: ${order.coupon_code}\n💰 السعر قبل الخصم: ${productPrice.toLocaleString()} ج.م\n🎁 قيمة الخصم: ${((productPrice * discountPct) / 100).toLocaleString()} ج.م` : '',
         '',
         `المنتجات:`,
         itemsList,
         '',
         `الإجمالي النهائي: ${finalPrice.toLocaleString('en-US')} ج.م`,
         '',
         `رابط الفاتورة:`,
         invoiceLink,
         '',
         `شكراً لكم!`
      ].filter(line => line !== '').join('\n').normalize('NFC')
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

   const selectedTheme = row.selected_theme || 'default'

   // ─── THEME: ELEGANT ────────────────────────────────────────────────────────
   if (selectedTheme === 'elegant') {
      return (
         <div className="min-h-screen bg-white font-inter" dir="rtl" style={{ '--primary': primaryColor } as any}>
            <header className="border-b border-zinc-100 py-8 no-print">
               <div className="mx-auto max-w-4xl px-6 flex justify-between items-center">
                  <h1 className="text-xl font-light italic tracking-tighter text-zinc-900 uppercase">{storeName}</h1>
                  <Link href={storeBackHref} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 flex items-center gap-2">
                     العودة للمتجر <ArrowRight className="h-3 w-3 rotate-180" />
                  </Link>
               </div>
            </header>

            <main className="mx-auto max-w-4xl px-6 py-16 print:p-0">
               <div className="mb-16 text-center space-y-4 no-print">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full border border-zinc-900 mb-4">
                     <CheckCircle2 className="h-8 w-8 text-zinc-900" />
                  </div>
                  <h2 className="text-3xl font-light tracking-tighter text-zinc-900">تم استلام طلبك بنجاح</h2>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">شكراً لتسوقكم من {storeName}</p>

                  <div className="pt-8 flex justify-center">
                     <InvoiceActions
                        order={order}
                        items={items}
                        storeInfo={storeInfo}
                        branding={storeBranding}
                        settings={storeSettings}
                        hasPdfInvoice={config.hasPdfInvoice}
                        storeName={storeName}
                        whatsappUrl={whatsappUrl}
                        primaryColor="#000"
                     />
                  </div>
               </div>

               <div className="border border-zinc-100 p-8 md:p-16 space-y-16 print:border-none print:p-0">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                     <div className="space-y-4">
                        {storeBranding?.logo_url ? (
                           <img src={storeBranding.logo_url} alt={storeName} className="h-16 object-contain grayscale" />
                        ) : (
                           <h1 className="text-3xl font-light italic tracking-tighter text-zinc-900 uppercase">{storeName}</h1>
                        )}
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{storeBranding?.tagline}</p>
                     </div>
                     <div className="text-right md:text-left space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">رقم الفاتورة</span>
                        <h3 className="text-2xl font-light tracking-tighter text-zinc-900">#{shortId}</h3>
                        <p className="text-[10px] font-bold text-zinc-400">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-y border-zinc-50 py-12">
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">بيانات العميل</h4>
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <User className="h-4 w-4 text-zinc-300" />
                              <span className="text-sm font-bold text-zinc-900">{order.customer_name}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-zinc-300" />
                              <span className="text-sm font-bold text-zinc-900" dir="ltr">{order.customer_phone}</span>
                           </div>
                           <div className="flex items-start gap-3">
                              <MapPin className="h-4 w-4 text-zinc-300 mt-0.5" />
                              <span className="text-sm font-bold text-zinc-900 leading-relaxed">{order.customer_address}</span>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">تفاصيل الدفع</h4>
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <Wallet className="h-4 w-4 text-zinc-300" />
                              <span className="text-sm font-bold text-zinc-900">{order.payment_method === 'cod' ? 'الدفع عند الاستلام' : order.payment_method}</span>
                           </div>
                           {depositAmount > 0 && order.payment_method === 'cod' && (
                              <div className="bg-zinc-50 p-6 space-y-3">
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">العربون المطلوب</span>
                                    <span className="text-sm font-black text-zinc-900">{depositAmount.toLocaleString()} ج.م</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">المتبقي</span>
                                    <span className="text-sm font-black text-zinc-900">{(finalPrice - depositAmount).toLocaleString()} ج.م</span>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">المنتجات</h4>
                     <div className="space-y-6">
                        {(items.length > 0 ? items : [{ product_name: order.product_name, quantity: 1, product_price: order.product_price }]).map((item: any, idx: number) => (
                           <div key={idx} className="flex justify-between items-center group">
                              <div className="flex items-center gap-6">
                                 <span className="text-[10px] font-bold text-zinc-300 italic">{item.quantity}x</span>
                                 <span className="text-sm font-bold text-zinc-900 uppercase tracking-wide">{item.product_name}</span>
                              </div>
                              <span className="text-sm font-light text-zinc-400">{(item.product_price * item.quantity).toLocaleString()} ج.م</span>
                           </div>
                        ))}
                     </div>

                     <div className="pt-12 border-t border-zinc-100 space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">المجموع الفرعي</span>
                           <span className="text-sm font-bold">{productPrice.toLocaleString()} ج.م</span>
                        </div>
                        {discountPct > 0 && (
                           <div className="flex justify-between items-center text-zinc-900">
                              <span className="text-[10px] font-black uppercase tracking-widest italic">خصم ({order.coupon_code || discountPct + '%'})</span>
                              <span className="text-sm font-bold">-{(productPrice * discountPct / 100).toLocaleString()} ج.م</span>
                           </div>
                        )}
                        <div className="flex justify-between items-end pt-8">
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">الإجمالي الكلي</span>
                           <span className="text-4xl font-light text-zinc-900 tracking-tighter">{finalPrice.toLocaleString()} ج.م</span>
                        </div>
                     </div>
                  </div>

                  {(storeBranding?.invoice_instapay || storeBranding?.invoice_wallet) && (
                     <div className="pt-16 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {storeBranding?.invoice_instapay && (
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">إنستا باي (InstaPay)</h4>
                              <CopyableText text={storeBranding.invoice_instapay} label="اضغط للنسخ" />
                           </div>
                        )}
                        {storeBranding?.invoice_wallet && (
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">محفظة إلكترونية</h4>
                              <CopyableText text={storeBranding.invoice_wallet} label="اضغط للنسخ" />
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </main>
         </div>
      )
   }

   // ─── THEME: FLORAL (BLOOM) ────────────────────────────────────────────────
   if (selectedTheme === 'floral') {
      return (
         <div className="min-h-screen bg-[#FAF3F0] font-inter relative overflow-hidden" dir="rtl" style={{ '--primary': primaryColor } as any}>
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
               <svg width="200" height="200" viewBox="0 0 100 100" className="rotate-12">
                  <path d="M50 0 C60 30 90 40 100 50 C90 60 60 70 50 100 C40 70 10 60 0 50 C10 40 40 30 50 0" fill="var(--primary)" />
               </svg>
            </div>
            <div className="absolute bottom-0 left-0 p-12 opacity-10 pointer-events-none">
               <svg width="300" height="300" viewBox="0 0 100 100" className="-rotate-12">
                  <path d="M50 0 C70 20 100 20 100 50 C100 80 70 80 50 100 C30 80 0 80 0 50 C0 20 30 20 50 0" fill="var(--primary)" />
               </svg>
            </div>

            <header className="py-10 no-print relative z-10">
               <div className="mx-auto max-w-4xl px-6 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[var(--primary)]">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                     </svg>
                     <h1 className="text-xl font-serif italic text-zinc-800">{storeName}</h1>
                  </div>
                  <Link href={storeBackHref} className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                     العودة للمتجر <ArrowRight className="h-3 w-3 rotate-180" />
                  </Link>
               </div>
            </header>

            <main className="mx-auto max-w-4xl px-6 pb-20 print:p-0 relative z-10">
               <div className="mb-16 text-center space-y-6 no-print">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white shadow-xl shadow-rose-100/50 border border-rose-50 mb-2">
                     <CheckCircle2 className="h-10 w-10 text-[var(--primary)]" />
                  </div>
                  <div className="space-y-2">
                     <h2 className="text-4xl font-serif italic text-zinc-800">تم استلام طلبكم</h2>
                     <p className="text-xs font-black text-[var(--primary)] uppercase tracking-[0.3em]">تم تأكيد طلبك من {storeName}</p>
                  </div>

                  <div className="pt-6 flex justify-center">
                     <InvoiceActions
                        order={order}
                        items={items}
                        storeInfo={storeInfo}
                        branding={storeBranding}
                        settings={storeSettings}
                        hasPdfInvoice={config.hasPdfInvoice}
                        storeName={storeName}
                        whatsappUrl={whatsappUrl}
                        primaryColor={primaryColor}
                     />
                  </div>
               </div>

               <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-rose-50 shadow-2xl shadow-rose-100/20 p-8 md:p-16 space-y-16 print:border-none print:shadow-none print:p-0">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                     <div className="space-y-4">
                        {storeBranding?.logo_url ? (
                           <img src={storeBranding.logo_url} alt={storeName} className="h-16 object-contain" />
                        ) : (
                           <h2 className="text-3xl font-serif italic text-zinc-800">{storeName}</h2>
                        )}
                        <div className="flex items-center gap-2 text-zinc-400">
                           <div className="h-1 w-8 rounded-full bg-[var(--primary)]/20" />
                           <p className="text-[10px] font-black uppercase tracking-widest">{storeBranding?.tagline || 'فاتورة المشتريات'}</p>
                        </div>
                     </div>
                     <div className="text-right md:text-left space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">رقم الفاتورة المميز</span>
                        <h3 className="text-3xl font-serif italic text-zinc-800 tracking-tight">#{shortId}</h3>
                        <p className="text-xs font-bold text-zinc-400" dir="ltr">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-y border-rose-50/50 py-12">
                     <div className="space-y-8">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">بيانات العميل</h4>
                        </div>
                        <div className="space-y-5 px-4">
                           <div className="flex items-center gap-4">
                              <User className="h-4 w-4 text-rose-200" />
                              <span className="text-sm font-bold text-zinc-800">{order.customer_name}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <Phone className="h-4 w-4 text-rose-200" />
                              <span className="text-sm font-bold text-zinc-800" dir="ltr">{order.customer_phone}</span>
                           </div>
                           <div className="flex items-start gap-4">
                              <MapPin className="h-4 w-4 text-rose-200 mt-1" />
                              <span className="text-sm font-bold text-zinc-800 leading-relaxed">{order.customer_address}</span>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-8">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">طريقة السداد</h4>
                        </div>
                        <div className="px-4 space-y-6">
                           <div className="flex items-center gap-4">
                              <Wallet className="h-4 w-4 text-rose-200" />
                              <span className="text-sm font-bold text-zinc-800">{order.payment_method === 'cod' ? 'الدفع عند الاستلام' : order.payment_method}</span>
                           </div>
                           {depositAmount > 0 && order.payment_method === 'cod' && (
                              <div className="bg-rose-50/30 rounded-[1.5rem] p-6 space-y-4 border border-rose-50">
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">العربون المطلوب</span>
                                    <span className="text-sm font-black text-[var(--primary)]">{depositAmount.toLocaleString()} ج.م</span>
                                 </div>
                                 <div className="h-px bg-rose-100/50" />
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">المتبقي عند الاستلام</span>
                                    <span className="text-sm font-black text-zinc-800">{(finalPrice - depositAmount).toLocaleString()} ج.م</span>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-10">
                     <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">محتويات الطلب</h4>
                     </div>
                     <div className="space-y-6 px-4">
                        {(items.length > 0 ? items : [{ product_name: order.product_name, quantity: 1, product_price: order.product_price }]).map((item: any, idx: number) => (
                           <div key={idx} className="flex justify-between items-center group">
                              <div className="flex items-center gap-6">
                                 <span className="text-xs font-serif italic text-rose-300">{item.quantity}x</span>
                                 <span className="text-sm font-bold text-zinc-800 uppercase tracking-wide">{item.product_name}</span>
                              </div>
                              <span className="text-sm font-medium text-zinc-400">{(item.product_price * item.quantity).toLocaleString()} ج.م</span>
                           </div>
                        ))}
                     </div>

                     <div className="pt-12 border-t border-rose-50 space-y-5 px-4">
                        <div className="flex justify-between items-center text-zinc-500">
                           <span className="text-[10px] font-black uppercase tracking-widest">المجموع قبل الخصم</span>
                           <span className="text-sm font-bold">{productPrice.toLocaleString()} ج.م</span>
                        </div>
                        {discountPct > 0 && (
                           <div className="flex justify-between items-center text-[var(--primary)]">
                              <span className="text-[10px] font-black uppercase tracking-widest italic">مكافأة الخصم ({order.coupon_code || discountPct + '%'})</span>
                              <span className="text-sm font-bold">-{(productPrice * discountPct / 100).toLocaleString()} ج.م</span>
                           </div>
                        )}
                        <div className="flex justify-between items-end pt-10">
                           <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">القيمة الإجمالية</span>
                           </div>
                           <span className="text-5xl font-serif italic text-zinc-800 tracking-tight">{finalPrice.toLocaleString()} <span className="text-lg not-italic font-bold text-zinc-400 ml-1">ج.م</span></span>
                        </div>
                     </div>
                  </div>

                  {(storeBranding?.invoice_instapay || storeBranding?.invoice_wallet) && (
                     <div className="pt-16 border-t border-rose-50 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {storeBranding?.invoice_instapay && (
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">حساب InstaPay</h4>
                              <CopyableText text={storeBranding.invoice_instapay} label="اضغط لنسخ الحساب" />
                           </div>
                        )}
                        {storeBranding?.invoice_wallet && (
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">رقم المحفظة الذكية</h4>
                              <CopyableText text={storeBranding.invoice_wallet} label="اضغط لنسخ الرقم" />
                           </div>
                        )}
                     </div>
                  )}

                  {storeSettings?.policies && (
                     <div className="pt-16 border-t border-rose-50">
                        <div className="max-w-2xl mx-auto text-center space-y-4 opacity-40">
                           <p className="text-[10px] font-black uppercase tracking-widest">سياساتنا</p>
                           <p className="text-[10px] font-bold leading-relaxed whitespace-pre-line">{storeSettings.policies}</p>
                        </div>
                     </div>
                  )}
               </div>
            </main>

            <footer className="py-12 text-center no-print relative z-10">
               <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.5em]">Kaya Market Platform</p>
            </footer>
         </div>
      )
   }

   // ─── THEME: DEFAULT ────────────────────────────────────────────────────────
   return (
      <div className="min-h-screen bg-zinc-50 font-inter" dir="rtl" style={{ '--primary': primaryColor } as any}>
         <header className="bg-white border-b border-zinc-100 py-6 no-print">
            <div className="mx-auto max-w-4xl px-6 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--primary)]/20">
                     <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                     <h1 className="text-xl font-black text-zinc-900">فاتورة الطلب</h1>
                     <p className="text-xs font-bold text-zinc-400">#{shortId}</p>
                  </div>
               </div>
               <Link href={storeBackHref} className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  العودة للمتجر
               </Link>
            </div>
         </header>

         <main className="mx-auto max-w-4xl px-6 py-12 print:p-0">
            <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
               <div className="p-8 md:p-12 space-y-12">
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                     <div className="space-y-4">
                        {storeBranding?.logo_url ? (
                           <img src={storeBranding.logo_url} alt={storeName} className="h-12 object-contain" />
                        ) : (
                           <h2 className="text-2xl font-black text-zinc-900">{storeName}</h2>
                        )}
                        <div className="space-y-1">
                           <p className="text-sm font-bold text-zinc-500 flex items-center gap-2">
                              <Building2 className="h-4 w-4 opacity-40" />
                              {storeName}
                           </p>
                           {storeInfo.whatsapp_phone && (
                              <p className="text-sm font-bold text-zinc-500 flex items-center gap-2" dir="ltr">
                                 <Phone className="h-4 w-4 opacity-40" />
                                 {storeInfo.whatsapp_phone}
                              </p>
                           )}
                        </div>
                     </div>
                     <div className="text-right md:text-left space-y-4">
                        <InvoiceActions
                           order={order}
                           items={items}
                           storeInfo={storeInfo}
                           branding={storeBranding}
                           settings={storeSettings}
                           hasPdfInvoice={config.hasPdfInvoice}
                           storeName={storeName}
                           whatsappUrl={whatsappUrl}
                           primaryColor={primaryColor}
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-zinc-100">
                     <div className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1">بيانات العميل</h4>
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
                                 <User className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-bold text-zinc-900">{order.customer_name}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
                                 <Phone className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-bold text-zinc-900" dir="ltr">{order.customer_phone}</span>
                           </div>
                           <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                                 <MapPin className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-bold text-zinc-900 leading-relaxed">{order.customer_address}</span>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1">تفاصيل الدفع</h4>
                        <div className="bg-zinc-50 rounded-2xl p-5 space-y-3">
                           <div className="flex justify-between items-center text-sm font-bold">
                              <span className="text-zinc-500">طريقة الدفع</span>
                              <span className="text-zinc-900">{order.payment_method === 'cod' ? 'دفع عند الاستلام' : order.payment_method}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm font-bold">
                              <span className="text-zinc-500">الحالة</span>
                              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase">
                                 {order.status === 'pending' ? 'قيد المراجعة' : order.status === 'confirmed' ? 'تم التأكيد' : order.status === 'processing' ? 'جاري التجهيز' : order.status === 'shipped' ? 'تم الشحن' : order.status === 'delivered' ? 'تم التوصيل' : order.status}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6 pt-12 border-t border-zinc-100">
                     <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1">المنتجات</h4>
                     <div className="space-y-4">
                        {(items.length > 0 ? items : [{ product_name: order.product_name, quantity: 1, product_price: order.product_price }]).map((item: any, idx: number) => (
                           <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100 hover:border-zinc-200 transition-colors">
                              <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center font-black text-zinc-900 text-xs">
                                    {item.quantity}x
                                 </div>
                                 <span className="text-sm font-black text-zinc-900">{item.product_name}</span>
                              </div>
                              <span className="text-sm font-bold text-zinc-900">{(item.product_price * item.quantity).toLocaleString()} ج.م</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between gap-8">
                     {storeSettings?.policies && (
                        <div className="flex-1 max-w-md">
                           <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 px-1">سياسات المتجر</h4>
                           <p className="text-[10px] font-bold text-zinc-400 leading-relaxed whitespace-pre-line px-1">{storeSettings.policies}</p>
                        </div>
                     )}
                     <div className="w-full md:w-80 space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold text-zinc-500 px-1">
                           <span>المجموع الفرعي</span>
                           <span>{productPrice.toLocaleString()} ج.م</span>
                        </div>
                        {discountPct > 0 && (
                           <div className="flex justify-between items-center text-sm font-bold text-emerald-600 px-1">
                              <span>الخصم ({order.coupon_code || discountPct + '%'})</span>
                              <span>-{(productPrice * discountPct / 100).toLocaleString()} ج.م</span>
                           </div>
                        )}
                        <div className="h-px bg-zinc-100 my-4" />
                        <div className="flex justify-between items-center px-1">
                           <span className="text-lg font-black text-zinc-900">الإجمالي</span>
                           <span className="text-2xl font-black text-zinc-900">{finalPrice.toLocaleString()} ج.م</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </main>

         <footer className="py-12 text-center no-print opacity-40">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Kaya Market Platform</p>
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
