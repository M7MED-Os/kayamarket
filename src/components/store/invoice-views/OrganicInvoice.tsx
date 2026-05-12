'use client'

import React from 'react'
import { CheckCircle2, Wallet, ArrowRight, User, MapPin, Phone, Smartphone, Leaf, Printer, Share2 } from 'lucide-react'
import Link from 'next/link'
import { KayaBadge } from '@/components/store/KayaBadge'
import InvoiceActions from '@/components/InvoiceActions'
import CopyableText from '@/components/CopyableText'

interface InvoiceViewProps {
  order: any
  items: any[]
  storeInfo: any
  storeBranding: any
  storeSettings: any
  config: any
  showWatermark: boolean
  shortId: string
  primaryColor: string
  storeName: string
  storeBackHref: string
  finalPrice: number
  productPrice: number
  shippingCost: number
  discountPct: number
  depositAmount: number
  whatsappUrl: string | null
}

export default function OrganicInvoice({
  order, items, storeInfo, storeBranding, storeSettings, config, showWatermark, shortId, primaryColor, storeName, storeBackHref,
  finalPrice, productPrice, shippingCost, discountPct, depositAmount, whatsappUrl
}: InvoiceViewProps) {
  return (
    <div className="min-h-screen bg-[#F9F7F2] font-inter relative overflow-hidden" dir="rtl" style={{ '--primary': primaryColor } as any}>
      {/* Decorative Organic Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <header className="py-10 no-print relative z-10">
        <div className="mx-auto max-w-4xl px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-[var(--primary)] rounded-xl rotate-12 flex items-center justify-center text-white shadow-lg shadow-[var(--primary)]/20">
                <Leaf className="h-5 w-5" />
             </div>
             <h1 className="text-xl font-black text-zinc-900">{storeName}</h1>
          </div>
          <Link href={storeBackHref} className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-[var(--primary)] transition-colors flex items-center gap-2">
            العودة للمتجر <ArrowRight className="h-3 w-3 rotate-180" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-20 print:p-0 relative z-10">
        <div className="mb-16 text-center space-y-6 no-print">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-[1.5rem] bg-white shadow-xl shadow-zinc-200/50 border border-zinc-100 mb-2 rotate-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-zinc-900 tracking-tight">شكراً لثقتك <span className="italic text-[var(--primary)]">بنا!</span></h2>
            <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">تم تأكيد طلبك بنجاح من {storeName}</p>
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

        <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-200/20 p-8 md:p-16 space-y-16 print:border-none print:shadow-none print:p-0">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-4">
              {storeBranding?.logo_url ? (
                <img src={storeBranding.logo_url} alt={storeName} className="h-16 object-contain" />
              ) : (
                <div className="flex items-center gap-3">
                   <div className="h-12 w-12 bg-[var(--primary)] rounded-2xl rotate-12 flex items-center justify-center text-white shadow-lg">
                      <Leaf className="h-6 w-6" />
                   </div>
                   <h2 className="text-2xl font-black text-zinc-900">{storeName}</h2>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-400">
                <div className="h-1 w-8 rounded-full bg-[var(--primary)]/20" />
                <p className="text-[10px] font-black uppercase tracking-widest">{storeBranding?.tagline || 'فاتورة المشتريات العضوية'}</p>
              </div>
            </div>
            <div className="text-right md:text-left space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">رقم الفاتورة</span>
              <h3 className="text-3xl font-black text-zinc-900 tracking-tight">#{shortId}</h3>
              <p className="text-xs font-bold text-zinc-400" dir="ltr">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-y border-zinc-100 py-12">
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">بيانات العميل</h4>
              </div>
              <div className="space-y-5 px-4">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">
                     <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-zinc-800">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">
                     <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-zinc-800" dir="ltr">{order.customer_phone}</span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400 shrink-0">
                     <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-zinc-800 leading-relaxed">{order.customer_address}</span>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">تفاصيل الدفع</h4>
              </div>
              <div className="px-4 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">
                     <Wallet className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-zinc-800">{order.payment_method === 'cod' ? 'الدفع عند الاستلام' : order.payment_method}</span>
                </div>
                {depositAmount > 0 && (order.payment_method?.toLowerCase() === 'cod' || order.payment_method?.includes('استلام')) && (
                  <div className="bg-[var(--primary)]/5 rounded-[2rem] p-8 space-y-4 border border-[var(--primary)]/10">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">المقدم</span>
                      <span className="text-sm font-black text-[var(--primary)]">{depositAmount.toLocaleString()} ج.م</span>
                    </div>
                    <div className="h-px bg-[var(--primary)]/10" />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">المتبقي</span>
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
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">المنتجات</h4>
            </div>
            <div className="space-y-6 px-4">
              {(items.length > 0 ? items : [{ product_name: order.product_name, quantity: 1, product_price: order.product_price, variant_info: order.variant_info }]).map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center group">
                  <div className="flex items-center gap-6">
                    <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 font-black text-xs">
                       {item.quantity}x
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-zinc-900 uppercase tracking-wide group-hover:text-[var(--primary)] transition-colors">{item.product_name}</span>
                      {item.variant_info && (item.variant_info.color || item.variant_info.size) && (
                        <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest mt-1">
                          {[item.variant_info.color, item.variant_info.size].filter(Boolean).join(' • ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-black text-zinc-900">{(Number(item.product_price || item.price || 0) * Number(item.quantity || 1)).toLocaleString()} ج.م</span>
                </div>
              ))}
            </div>

            <div className="pt-12 border-t border-zinc-100 space-y-5 px-4">
              <div className="flex justify-between items-center text-zinc-500">
                <span className="text-xs font-black uppercase tracking-widest">المجموع الفرعي</span>
                <span className="text-sm font-black text-zinc-900">{productPrice.toLocaleString()} ج.م</span>
              </div>
              {discountPct > 0 && (
                <div className="flex justify-between items-center text-[var(--primary)]">
                  <span className="text-xs font-black uppercase tracking-widest italic">خصم خاص ({order.coupon_code || discountPct + '%'})</span>
                  <span className="text-sm font-black">-{(productPrice * discountPct / 100).toLocaleString()} ج.م</span>
                </div>
              )}
              {shippingCost > 0 && (
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-xs font-black uppercase tracking-widest">تكلفة التوصيل</span>
                  <span className="text-sm font-black text-zinc-900">{shippingCost.toLocaleString()} ج.م</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">الإجمالي الكلي</span>
                </div>
                <span className="text-5xl font-black text-zinc-900 tracking-tight">{finalPrice.toLocaleString()} <span className="text-lg font-bold text-zinc-400 ml-1">ج.م</span></span>
              </div>
            </div>
          </div>

          {(storeBranding?.invoice_instapay || storeBranding?.invoice_wallet) && (
            <div className="pt-16 border-t border-zinc-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storeBranding?.invoice_instapay && (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:border-[var(--primary)]/30 transition-all group text-center sm:text-right">
                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-[var(--primary)] shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform shrink-0">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1 w-full">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">إنستا باي</p>
                      <div className="flex justify-center sm:justify-start whitespace-normal break-all">
                        <CopyableText text={storeBranding.invoice_instapay} label="اضغط للنسخ" />
                      </div>
                    </div>
                  </div>
                )}
                {storeBranding?.invoice_wallet && (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:border-[var(--primary)]/30 transition-all group text-center sm:text-right">
                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-[var(--primary)] shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform shrink-0">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1 w-full">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">المحفظة</p>
                      <div className="flex justify-center sm:justify-start whitespace-normal break-all">
                        <CopyableText text={storeBranding.invoice_wallet} label="اضغط للنسخ" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {storeSettings?.policies && (
            <div className="pt-12 border-t border-zinc-100">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-l from-[var(--primary)]/20 to-transparent" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)]">سياساتنا</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-[var(--primary)]/20 to-transparent" />
                </div>
                <div className="bg-zinc-50/50 p-10 rounded-[3rem] border border-zinc-100">
                  <p className="text-xs font-bold text-zinc-500 leading-relaxed whitespace-pre-line italic">{storeSettings.policies}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 text-center no-print relative z-10">
        {!showWatermark && (
          <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.5em]">Kaya Market Platform</p>
        )}
      </footer>
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999] no-print">
          <KayaBadge href="https://kayamarket.vercel.app" />
        </div>
      )}
    </div>
  )
}
