'use client'

import React from 'react'
import { CheckCircle2, Wallet, ArrowRight, User, MapPin, Phone, Smartphone } from 'lucide-react'
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

export default function FloralInvoice({
  order, items, storeInfo, storeBranding, storeSettings, config, showWatermark, shortId, primaryColor, storeName, storeBackHref,
  finalPrice, productPrice, shippingCost, discountPct, depositAmount, whatsappUrl
}: InvoiceViewProps) {
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
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white shadow-xl shadow-[var(--primary)]/5 border border-[var(--primary)]/10 mb-2">
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

        <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-[var(--primary)]/10 shadow-2xl shadow-[var(--primary)]/5 p-8 md:p-16 space-y-16 print:border-none print:shadow-none print:p-0">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-y border-[var(--primary)]/10 py-12">
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">بيانات العميل</h4>
              </div>
              <div className="space-y-5 px-4">
                <div className="flex items-center gap-4">
                  <User className="h-4 w-4 text-[var(--primary)]/30" />
                  <span className="text-sm font-bold text-zinc-800">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-4 w-4 text-[var(--primary)]/30" />
                  <span className="text-sm font-bold text-zinc-800" dir="ltr">{order.customer_phone}</span>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="h-4 w-4 text-[var(--primary)]/30 mt-1" />
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
                  <Wallet className="h-4 w-4 text-[var(--primary)]/30" />
                  <span className="text-sm font-bold text-zinc-800">{order.payment_method === 'cod' ? 'الدفع عند الاستلام' : order.payment_method}</span>
                </div>
                {depositAmount > 0 && (order.payment_method?.toLowerCase() === 'cod' || order.payment_method?.includes('استلام')) && (
                  <div className="bg-[var(--primary)]/5 rounded-[1.5rem] p-6 space-y-4 border border-[var(--primary)]/10">
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
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">محتويات الطلب</h4>
            </div>
            <div className="space-y-6 px-4">
              {(items.length > 0 ? items : [{ product_name: order.product_name, quantity: 1, product_price: order.product_price, variant_info: order.variant_info }]).map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center group">
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-serif italic text-[var(--primary)]/60">{item.quantity}x</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-800 uppercase tracking-wide">{item.product_name}</span>
                      {item.variant_info && (item.variant_info.color || item.variant_info.size) && (
                        <span className="text-[9px] font-black text-[var(--primary)] uppercase tracking-[0.2em] mt-1">
                          {[item.variant_info.color, item.variant_info.size].filter(Boolean).join(' • ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-zinc-400">{(Number(item.product_price || item.price || 0) * Number(item.quantity || 1)).toLocaleString()} ج.م</span>
                </div>
              ))}
            </div>

            <div className="pt-12 border-t border-[var(--primary)]/10 space-y-5 px-4">
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
              {shippingCost > 0 && (
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">تكلفة التوصيل</span>
                  <span className="text-sm font-bold">{shippingCost.toLocaleString()} ج.م</span>
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
            <div className="pt-16 border-t border-[var(--primary)]/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storeBranding?.invoice_instapay && (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-6 bg-[var(--primary)]/5 rounded-3xl border border-[var(--primary)]/10 hover:bg-[var(--primary)]/10 transition-all group text-center sm:text-right">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[var(--primary)] shadow-sm border border-[var(--primary)]/10 group-hover:scale-110 transition-transform shrink-0">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1 w-full">
                      <p className="text-[10px] font-black text-[var(--primary)]/60 uppercase tracking-widest">إنستا باي</p>
                      <div className="flex justify-center sm:justify-start whitespace-normal break-all">
                        <CopyableText text={storeBranding.invoice_instapay} label="اضغط للنسخ" />
                      </div>
                    </div>
                  </div>
                )}
                {storeBranding?.invoice_wallet && (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-6 bg-[var(--primary)]/5 rounded-3xl border border-[var(--primary)]/10 hover:bg-[var(--primary)]/10 transition-all group text-center sm:text-right">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[var(--primary)] shadow-sm border border-[var(--primary)]/10 group-hover:scale-110 transition-transform shrink-0">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1 w-full">
                      <p className="text-[10px] font-black text-[var(--primary)]/60 uppercase tracking-widest">المحفظة</p>
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
            <div className="pt-8 border-t border-[var(--primary)]/10">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-l from-[var(--primary)]/20 to-transparent" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)]">سياساتنا</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-[var(--primary)]/20 to-transparent" />
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2rem] border border-[var(--primary)]/10">
                  <p className="text-[11px] font-bold text-zinc-500 leading-relaxed whitespace-pre-line">{storeSettings.policies}</p>
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
