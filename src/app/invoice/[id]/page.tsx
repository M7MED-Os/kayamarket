import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import Loading from '@/app/loading'

// Dynamic Imports for Invoice Views
const InvoiceViews = {
  elegant: dynamic(() => import('@/components/store/invoice-views/ElegantInvoice'), { loading: () => <Loading /> }),
  floral: dynamic(() => import('@/components/store/invoice-views/FloralInvoice'), { loading: () => <Loading /> }),
  organic: dynamic(() => import('@/components/store/invoice-views/OrganicInvoice'), { loading: () => <Loading /> }),
  default: dynamic(() => import('@/components/store/invoice-views/DefaultInvoice'), { loading: () => <Loading /> }),
}

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

   let rows: any[] | null = null
   let rpcError: any = null

   // 1. Check if there's a logged-in user (Merchant)
   const { data: { user } } = await supabase.auth.getUser()

   // 2. Fetch Order + Items + Store Config in one go using RPC
   const { data: rpcRows, error: err } = await supabase.rpc('get_order_invoice_v3', {
      p_order_id: id,
      p_token: (token && typeof token === 'string' && token !== 'null') ? token : null,
   })
   rows = rpcRows
   rpcError = err

   // 3. Fallback for Merchant view if RPC fails or returns empty
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
               shipping_cost: adminOrder.shipping_cost,
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
   const items = row.items || []
   const storeInfo = {
      id: row.store_id,
      name: row.store_name,
      slug: row.store_slug,
      whatsapp_phone: row.whatsapp,
      plan: row.store_plan || row.plan
   }
   const storeBranding = {
      primary_color: row.primary_color,
      logo_url: row.logo_url,
      tagline: row.tagline,
      invoice_instapay: row.instapay,
      invoice_wallet: row.wallet
   }

   // Fetch settings for latest deposit info
   const { data: dbSettings } = await supabase.from('store_settings').select('*').eq('store_id', row.store_id).single()
   const storeSettings = {
      cod_deposit_required: dbSettings?.cod_deposit_required ?? row.cod_deposit_required,
      deposit_percentage: dbSettings?.deposit_percentage ?? row.deposit_percentage,
      policies: dbSettings?.policies ?? row.policies
   }

   const { getPlanConfig, getDynamicPlanConfigs } = await import('@/lib/subscription')
   const rawPlan = storeInfo?.plan as string || 'starter'
   const plan = (rawPlan.toLowerCase() === 'free' ? 'starter' : rawPlan.toLowerCase()) as import('@/lib/subscription').PlanTier
   const dynamicConfigs = await getDynamicPlanConfigs(supabase)
   const config = dynamicConfigs[plan] || getPlanConfig(plan)
   const showWatermark = config ? !config.canRemoveWatermark : true

   const storeName = storeInfo?.name ?? 'متجرنا'
   const storeBackHref = storeInfo?.slug ? `/store/${storeInfo.slug}` : '/'

   const finalPrice = Number(row.final_price)
   const discountPct = Number(row.discount_pct || row.discount_percentage || 0)
   const productPrice = Number(row.product_price)
   const shippingCost = Number(row.shipping_cost || 0)
   const depositAmount = storeSettings?.cod_deposit_required ? Math.round((finalPrice * (Number(storeSettings.deposit_percentage) || 50)) / 100) : 0

   const shortId = id.split('-')[0].toUpperCase()
   const primaryColor = storeBranding?.primary_color || '#0ea5e9'

   const headersList = await headers()
   const host = headersList.get('host') || 'kayamarket.com'
   const protocol = host.includes('localhost') ? 'http' : 'https'
   const invoiceLink = `${protocol}://${host}/invoice/${id}${token ? `?token=${token}` : ''}`

   const isPremiumWhatsapp = config.hasProfessionalWhatsapp
   let waMessage = ''
   const itemsList = items && items.length > 0
      ? items.map((i: any) => `• ${i.product_name} (${i.quantity}x)`).join('\n')
      : `• ${row.product_name}`

   if (isPremiumWhatsapp) {
      waMessage = [
         `مرحباً، أود تأكيد طلبي الجديد من متجركم (${storeName})!`,
         '',
         `تفاصيل العميل:`,
         `الاسم: ${row.customer_name}`,
         `رقم الهاتف: ${row.customer_phone}`,
         `عنوان التوصيل: ${row.customer_address}`,
         '',
         `تفاصيل الطلب:`,
         `رقم الطلب: #${shortId}`,
         `وقت الطلب: ${new Date(row.created_at).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo', dateStyle: 'medium', timeStyle: 'short' })}`,
         `طريقة الدفع: ${row.payment_method}`,
         row.coupon_code ? `🎟️ الكوبون: ${row.coupon_code}\n💰 السعر قبل الخصم: ${productPrice.toLocaleString()} ج.م\n🎁 قيمة الخصم: ${((productPrice * discountPct) / 100).toLocaleString()} ج.م` : '',
         shippingCost > 0 ? `🚚 الشحن: ${shippingCost.toLocaleString()} ج.م` : '',
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
   const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}` : null

   const selectedTheme = row.selected_theme || 'default'
   const CurrentInvoiceView = (InvoiceViews as any)[selectedTheme] || InvoiceViews.default

   return (
      <CurrentInvoiceView
         order={row}
         items={items}
         storeInfo={storeInfo}
         storeBranding={storeBranding}
         storeSettings={storeSettings}
         config={config}
         showWatermark={showWatermark}
         shortId={shortId}
         primaryColor={primaryColor}
         storeName={storeName}
         storeBackHref={storeBackHref}
         finalPrice={finalPrice}
         productPrice={productPrice}
         shippingCost={shippingCost}
         discountPct={discountPct}
         depositAmount={depositAmount}
         whatsappUrl={whatsappUrl}
      />
   )
}

function InvalidInvoiceLink() {
   return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
         <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-12 text-center space-y-8">
            <div className="h-24 w-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2">
               <Search className="h-10 w-10 text-rose-500" />
            </div>
            <div className="space-y-3">
               <h2 className="text-2xl font-black text-slate-900">رابط الفاتورة غير صالح</h2>
               <p className="text-slate-500 font-bold leading-relaxed">
                  عذراً، هذا الرابط قد انتهى أو غير موجود في سجلاتنا. يرجى مراجعة رقم الطلب أو التواصل مع المتجر.
               </p>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-95">
               العودة للرئيسية
               <ArrowRight className="h-5 w-5 rotate-180" />
            </Link>
         </div>
      </div>
   )
}
