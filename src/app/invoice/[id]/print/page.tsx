import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Building2, Phone, User } from 'lucide-react'
import { getStoreById } from '@/lib/tenant/get-store'

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) notFound()

  // Fetch Store & Branding Dynamically
  const { store, branding, settings: storeSettings } = await getStoreById(order.store_id)
  
  const storeName = store?.name || 'متجرنا'
  const primaryColor = branding?.primary_color || '#e11d48'
  const tagline = branding?.tagline || 'شكراً لتعاملكم معنا'
  const logoUrl = branding?.logo_url || ''
  const instapay = branding?.invoice_instapay || 'غير مسجل'
  const wallet = branding?.invoice_wallet || 'غير مسجل'
  const whatsapp = store?.whatsapp_phone || 'غير مسجل'

  const shortId = order.id.split('-')[0].toUpperCase()

  // Calculations
  const originalPrice = Number(order.product_price || 0)
  const discountPercent = Number(order.discount_percentage || 0)
  const discountAmount = (originalPrice * discountPercent) / 100
  const finalPrice = Number(order.final_price || originalPrice)
  
  // Logic for messages
  const isCOD = order.payment_method === 'الدفع عند الاستلام'
  const codDepositRequired = isCOD && storeSettings?.cod_deposit_required
  const depositAmount = (finalPrice * Number(storeSettings?.deposit_percentage || 0)) / 100
  const remainingAmount = finalPrice - depositAmount

  let statusMessage = ""
  if (!isCOD) {
      statusMessage = `لإتمام الطلب يرجى دفع إجمالي المبلغ (${finalPrice.toFixed(2)} ج.م) وإرسال إيصال الدفع (سكرين شوت) مع هذه الفاتورة على الواتساب للبدء في تجهيز طلبك فوراً.`
  } else if (codDepositRequired) {
      statusMessage = `يرجى دفع مقدم بقيمة ${depositAmount.toFixed(2)} ج.م وإرسال إيصال الدفع مع هذه الفاتورة على الواتساب لتأكيد الحجز والبدء في تجهيز طلبك. الباقي (${remainingAmount.toFixed(2)} ج.م) عند الاستلام.`
  } else {
      statusMessage = `تم تسجيل طلبك بنجاح. يرجى إرسال هذه الفاتورة عبر الواتساب الآن للبدء في تجهيز طلبك وتأكيد موعد التوصيل.`
  }

  return (
    <div className="bg-white min-h-screen p-0 m-0" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none; }
        }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; }
        
        .header-banner {
            background-color: ${primaryColor};
            padding: 40px 60px;
            color: white;
            position: relative;
            overflow: hidden;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .shape {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20%;
        }
        .shape-1 { width: 150px; height: 150px; top: -50px; left: -50px; transform: rotate(15deg); }
        .shape-2 { width: 100px; height: 100px; bottom: -20px; right: 20%; transform: rotate(-25deg); }
        .shape-3 { width: 60px; height: 60px; top: 20px; right: 10%; transform: rotate(45deg); }

        .logo-box {
            width: 70px;
            height: 70px;
            background: white;
            border-radius: 18px;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
      `}} />
      
      {/* Auto-print script */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 1000);
        };
      `}} />

      <div className="w-[210mm] min-h-[297mm] bg-white mx-auto relative shadow-none overflow-hidden">
        
        {/* Header Banner - Logo + Name side by side */}
        <header className="header-banner">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>

            <div className="relative z-10 flex items-center gap-6">
                {logoUrl && (
                    <div className="logo-box">
                        <img src={logoUrl} alt="Logo" className="max-w-full max-h-full rounded-xl object-contain" />
                    </div>
                )}
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">{storeName}</h1>
                    <p className="text-xs font-medium opacity-90 mt-1">{tagline}</p>
                </div>
            </div>

            <div className="text-left relative z-10">
                <div className="mb-4">
                    <p className="text-[9px] uppercase font-bold opacity-70 mb-1">تاريخ الإصدار</p>
                    <p className="text-lg font-black">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
                <div>
                    <p className="text-[9px] uppercase font-bold opacity-70 mb-1">رقم الفاتورة</p>
                    <p className="text-lg font-black">#{shortId}</p>
                </div>
            </div>
        </header>

        <div className="p-12">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="bg-zinc-50 border border-zinc-100 rounded-[2rem] p-8">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: primaryColor }}>بيانات العميل</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">الاسم الكامل</p>
                            <p className="text-base font-bold text-zinc-900">{order.customer_name || 'عميل غير مسجل'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">رقم الهاتف</p>
                            <p className="text-base font-bold text-zinc-900" dir="ltr" style={{ textAlign: 'right' }}>{order.customer_phone || 'غير مسجل'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">عنوان التوصيل</p>
                            <p className="text-base font-bold text-zinc-900">{order.customer_address || 'غير مسجل'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 rounded-[2rem] p-8">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: primaryColor }}>بيانات التواصل</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">طريقة الدفع</p>
                            <p className="text-base font-bold text-zinc-900">{order.payment_method}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">InstaPay</p>
                            <p className="text-base font-bold text-zinc-900" dir="ltr" style={{ textAlign: 'right' }}>{instapay}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">رقم المحفظة</p>
                            <p className="text-base font-bold text-zinc-900" dir="ltr" style={{ textAlign: 'right' }}>{wallet}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SMART STATUS ALERT */}
            <div className="mb-10 p-6 bg-zinc-50 border-r-4 rounded-xl text-center" style={{ borderColor: primaryColor }}>
                <p className="text-zinc-900 font-bold text-base leading-relaxed">
                    {statusMessage}
                </p>
            </div>

            {/* Table */}
            <div className="mb-10">
                <table className="w-full text-right">
                    <thead>
                        <tr className="border-b-2 border-zinc-900">
                            <th className="py-4 text-xs font-black text-zinc-400 uppercase tracking-widest">المنتج</th>
                            <th className="py-4 text-xs font-black text-zinc-400 uppercase tracking-widest text-center">الكمية</th>
                            <th className="py-4 text-xs font-black text-zinc-400 uppercase tracking-widest text-left">السعر</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        <tr>
                            <td className="py-6">
                                <p className="text-lg font-bold text-zinc-900">{order.product_name}</p>
                            </td>
                            <td className="py-6 text-center font-bold text-zinc-900">1</td>
                            <td className="py-6 text-left font-black text-zinc-900 text-lg">{originalPrice.toFixed(2)} ج.م</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-80 space-y-3">
                    <div className="flex justify-between text-sm font-bold text-zinc-500">
                        <span>المجموع الفرعي:</span>
                        <span>{originalPrice.toFixed(2)} ج.م</span>
                    </div>
                    
                    {discountPercent > 0 && (
                        <div className="flex justify-between text-sm font-black text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                            <span>خصم الكوبون ({order.coupon_code || discountPercent + '%'}):</span>
                            <span dir="ltr">-{discountAmount.toFixed(2)} ج.م</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t-2 border-zinc-100">
                        <span className="text-lg font-black text-zinc-900">الإجمالي النهائي:</span>
                        <div className="flex flex-col items-end">
                            {discountPercent > 0 && (
                                <span className="text-sm font-bold text-zinc-400 line-through">
                                    {originalPrice.toFixed(2)} ج.م
                                </span>
                            )}
                            <span className="text-3xl font-black" style={{ color: primaryColor }}>{finalPrice.toFixed(2)} ج.م</span>
                        </div>
                    </div>
                    
                    {codDepositRequired && order.payment_method === 'الدفع عند الاستلام' && (
                        <div className="mt-4 p-5 rounded-2xl bg-amber-50 border-2 border-amber-100 border-dashed space-y-2">
                          <div className="flex justify-between items-center text-amber-900">
                            <span className="text-sm font-black">العربون المطلوب (الآن):</span>
                            <span className="text-lg font-black">{depositAmount.toFixed(2)} ج.م</span>
                          </div>
                          <div className="flex justify-between items-center text-amber-700/70 border-t border-amber-200/50 pt-2">
                            <span className="text-xs font-bold">المتبقي عند الاستلام:</span>
                            <span className="text-sm font-bold">{(finalPrice - depositAmount).toFixed(2)} ج.م</span>
                          </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-10 border-t border-zinc-100 text-center">
                <p className="text-sm font-bold text-zinc-900 mb-2">شكراً لاختيارك {storeName}</p>
                <p className="text-[10px] text-zinc-400 font-medium">تم إصدار هذه الفاتورة إلكترونياً وهي معتمدة.</p>
            </div>
        </div>
      </div>
    </div>
  )
}
