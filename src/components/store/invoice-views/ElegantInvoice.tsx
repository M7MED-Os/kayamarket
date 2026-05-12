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

export default function ElegantInvoice({
  order, items, storeInfo, storeBranding, storeSettings, config, showWatermark, shortId, primaryColor, storeName, storeBackHref,
  finalPrice, productPrice, shippingCost, discountPct, depositAmount, whatsappUrl
}: InvoiceViewProps) {
  return (
    <div className="min-h-screen bg-white font-inter" dir="rtl" style={{ '--primary': primaryColor } as any}>
      <header className="border-b border-zinc-100 py-8 no-print">
        <div className="mx-auto max-w-4xl px-6 flex justify-between items-center">
          <h1 className="text-xl font-light italic tracking-tighter text-zinc-900 uppercase">{storeName}</h1>
          <Link href={storeBackHref} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[var(--primary)] flex items-center gap-2 transition-colors">
            العودة للمتجر <ArrowRight className="h-3 w-3 rotate-180" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 print:p-0">
        <div className="mb-16 text-center space-y-4 no-print">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-none border border-[var(--primary)] mb-4">
            <CheckCircle2 className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <h2 className="text-3xl font-light tracking-tighter text-zinc-900 uppercase">تم استلام <span className="font-bold italic text-[var(--primary)]">طلبك</span> بنجاح</h2>
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
              primaryColor={primaryColor}
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
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-[var(--primary)]/30" />
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{storeBranding?.tagline || 'فاتورة معتمدة'}</p>
              </div>
            </div>
            <div className="text-right md:text-left space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">رقم الفاتورة</span>
              <h3 className="text-2xl font-light tracking-tighter text-zinc-900">#{shortId}</h3>
              <p className="text-[10px] font-bold text-zinc-400">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-y border-zinc-50 py-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                <div className="h-1 w-1 bg-[var(--primary)]" />
                بيانات العميل
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-[var(--primary)]/40" />
                  <span className="text-sm font-bold text-zinc-900">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[var(--primary)]/40" />
                  <span className="text-sm font-bold text-zinc-900" dir="ltr">{order.customer_phone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[var(--primary)]/40 mt-0.5" />
                  <span className="text-sm font-bold text-zinc-900 leading-relaxed">{order.customer_address}</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                <div className="h-1 w-1 bg-[var(--primary)]" />
                تفاصيل الدفع
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-[var(--primary)]/40" />
                  <span className="text-sm font-bold text-zinc-900">
                    {(() => {
                      const map: Record<string, string> = {
                        'cod': 'الدفع عند الاستلام',
                        'vodafone_cash': 'فودافون كاش',
                        'instapay': 'إنستا باي',
                        'bank_transfer': 'تحويل بنكي',
                        'wallet': 'محفظة إلكترونية',
                        'cib_smart_wallet': 'محفظة CIB الذكية',
                        'orange_cash': 'أورانج كاش',
                        'etisalat_cash': 'اتصالات كاش'
                      }
                      return map[order.payment_method] || (order.payment_method === 'cod' ? 'الدفع عند الاستلام' : order.payment_method)
                    })()}
                  </span>
                </div>
                {depositAmount > 0 && (order.payment_method?.toLowerCase() === 'cod' || order.payment_method?.includes('استلام')) && (
                  <div className="bg-zinc-50 p-6 space-y-3 border-r-2 border-[var(--primary)]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">العربون المطلوب</span>
                      <span className="text-sm font-black text-[var(--primary)]">{depositAmount.toLocaleString()} ج.م</span>
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
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
              <div className="h-1 w-1 bg-[var(--primary)]" />
              المنتجات
            </h4>
            <div className="space-y-6">
              {(items.length > 0 ? items : [{ product_name: order.product_name, quantity: 1, product_price: order.product_price, variant_info: order.variant_info }]).map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center group">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold text-[var(--primary)] italic">{item.quantity}x</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-900 uppercase tracking-wide group-hover:text-[var(--primary)] transition-colors">{item.product_name}</span>
                      {item.variant_info && (item.variant_info.color || item.variant_info.size) && (
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                          {[item.variant_info.color, item.variant_info.size].filter(Boolean).join(' / ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-light text-zinc-400">{(Number(item.product_price || item.price || 0) * Number(item.quantity || 1)).toLocaleString()} ج.م</span>
                </div>
              ))}
            </div>

            <div className="pt-12 border-t border-zinc-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">المجموع الفرعي</span>
                <span className="text-sm font-bold text-zinc-900">{productPrice.toLocaleString()} ج.م</span>
              </div>
              {discountPct > 0 && (
                <div className="flex justify-between items-center text-[var(--primary)]">
                  <span className="text-[10px] font-black uppercase tracking-widest italic">خصم ({order.coupon_code || discountPct + '%'})</span>
                  <span className="text-sm font-bold">-{(productPrice * discountPct / 100).toLocaleString()} ج.م</span>
                </div>
              )}
              {shippingCost > 0 && (
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">مصاريف الشحن</span>
                  <span className="text-sm font-bold">{shippingCost.toLocaleString()} ج.م</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">الإجمالي الكلي</span>
                <span className="text-4xl font-bold text-[var(--primary)] tracking-tighter">{finalPrice.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          {(storeBranding?.invoice_instapay || storeBranding?.invoice_wallet) && (
            <div className="pt-16 border-t border-zinc-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storeBranding?.invoice_instapay && (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-[var(--primary)]/30 transition-all group text-center sm:text-right">
                    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-[var(--primary)] shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform shrink-0">
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
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-[var(--primary)]/30 transition-all group text-center sm:text-right">
                    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-[var(--primary)] shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform shrink-0">
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
            <div className="pt-10 border-t border-zinc-100">
              <div className="bg-zinc-50/50 p-8 space-y-4 border border-zinc-100">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-[var(--primary)]" />
                  سياسات المتجر
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-bold whitespace-pre-wrap">
                  {storeSettings.policies}
                </p>
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
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
