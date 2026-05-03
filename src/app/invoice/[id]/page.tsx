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
   // We pass the token if available. If not, the RPC will check auth.uid()
   let { data: rows, error: rpcError } = await supabase.rpc('get_order_invoice_v2', {
      p_order_id: id,
      p_token: (token && typeof token === 'string' && token !== 'null') ? token : null,
   })

   // 3. Fallback: If no data but user is logged in, try with Admin Client directly without RPC
   if ((!rows || rows.length === 0) && user) {
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

   if (selectedTheme === 'elegant') {
      return (
         <div className="min-h-screen bg-white font-inter" dir="rtl">
            <header className="border-b border-zinc-100 py-8 no-print">
               <div className="mx-auto max-w-4xl px-6 flex justify-between items-center">
                  <h1 className="text-xl font-light italic tracking-tighter text-zinc-900 uppercase">{storeName}</h1>
                  <Link href={storeBackHref} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 flex items-center gap-2">
                     العودة للمتجر <ArrowRight className="h-3 w-3 rotate-180" />
                  </Link>
               </div>
            </header>

            <main className="mx-auto max-w-4xl px-6 py-16 print:p-0">
               {/* Success Message */}
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

               {/* Elegant Invoice Card */}
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
                              <span className="text-sm font-bold text-zinc-900">{order.payment_method}</span>
                           </div>
                           {depositAmount > 0 && order.payment_method === 'الدفع عند الاستلام' && (
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
                        {items.map((item: any) => (
                           <div key={item.id} className="flex justify-between items-center group">
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
                           <span className="text-sm font-bold text-zinc-900">{productPrice.toLocaleString()} ج.م</span>
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

                  {/* Payment Details */}
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

               {storeSettings?.policies && (
                  <div className="mt-16 text-center max-w-2xl mx-auto opacity-40">
                     <p className="text-[10px] font-black uppercase tracking-widest mb-4">سياسات المتجر</p>
                     <p className="text-[10px] font-bold leading-relaxed whitespace-pre-line">{storeSettings.policies}</p>
                  </div>
               )}
            </main>

            <footer className="py-12 text-center no-print">
               <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">Kaya Market Platform</p>
            </footer>
         </div>
      )
   }

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
                  {/* Header Info */}
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

                  {/* Customer Info */}
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

                  {/* Order Items */}
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

                  {/* Total Summary */}
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
