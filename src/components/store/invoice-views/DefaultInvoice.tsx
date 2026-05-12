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

export default function DefaultInvoice({
  order, items, storeInfo, storeBranding, storeSettings, config, showWatermark, shortId, primaryColor, storeName, storeBackHref,
  finalPrice, productPrice, shippingCost, discountPct, depositAmount, whatsappUrl
}: InvoiceViewProps) {
  return (
    <div className="min-h-screen bg-zinc-50 font-inter" dir="rtl" style={{ '--primary': primaryColor } as any}>
      <header className="bg-white border-b border-zinc-100 py-6 no-print">
        <div className="mx-auto max-w-4xl px-6 flex justify-between items-center">
          <h1 className="text-xl font-black text-zinc-900">{storeName}</h1>
          <Link href={storeBackHref} className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2">
            العودة للمتجر
            <ArrowRight className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 print:p-0">
        <div className="mb-12 text-center space-y-4 no-print">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-50 text-emerald-500 mb-2">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-zinc-900">تم استلام طلبكم بنجاح</h2>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">شكراً لتسوقكم من {storeName}</p>
          </div>

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

        <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="p-8 md:p-16 space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="space-y-4">
                {storeBranding?.logo_url ? (
                  <img src={storeBranding.logo_url} alt={storeName} className="h-12 object-contain" />
                ) : (
                  <h2 className="text-2xl font-black text-zinc-900">{storeName}</h2>
                )}
                <div className="flex items-center gap-2 text-zinc-400">
                  <div className="h-1 w-8 rounded-full bg-zinc-200" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{storeBranding?.tagline || 'فاتورة طلب معتمدة'}</p>
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
                  <div className="h-2 w-2 rounded-full bg-zinc-900" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">بيانات العميل</h4>
                </div>
                <div className="space-y-5 px-4">
                  <div className="flex items-center gap-4">
                    <User className="h-4 w-4 text-zinc-300" />
                    <span className="text-sm font-bold text-zinc-800">{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="h-4 w-4 text-zinc-300" />
                    <span className="text-sm font-bold text-zinc-800" dir="ltr">{order.customer_phone}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="h-4 w-4 text-zinc-300 mt-1" />
                    <span className="text-sm font-bold text-zinc-800 leading-relaxed">{order.customer_address}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-zinc-900" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">تفاصيل الدفع</h4>
                </div>
                <div className="px-4 space-y-6">
                  <div className="flex items-center gap-4">
                    <Wallet className="h-4 w-4 text-zinc-300" />
                    <span className="text-sm font-bold text-zinc-800">{order.payment_method === 'cod' ? 'الدفع عند الاستلام' : order.payment_method}</span>
                  </div>
                  {depositAmount > 0 && (order.payment_method?.toLowerCase() === 'cod' || order.payment_method?.includes('استلام')) && (
                    <div className="bg-zinc-50 rounded-2xl p-6 space-y-4 border border-zinc-100">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">المقدم</span>
                        <span className="text-sm font-black text-zinc-900">{depositAmount.toLocaleString()} ج.م</span>
                      </div>
                      <div className="h-px bg-zinc-200" />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">المتبقي</span>
                        <span className="text-sm font-black text-zinc-900">{(finalPrice - depositAmount).toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-zinc-500">الحالة</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase">
                      {order.status === 'pending' ? 'قيد المراجعة' : order.status === 'confirmed' ? 'تم التأكيد' : order.status === 'processing' ? 'جاري التجهيز' : order.status === 'shipped' ? 'تم الشحن' : order.status === 'delivered' ? 'تم التوصيل' : order.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-zinc-900" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">محتويات الطلب</h4>
              </div>
              <div className="space-y-4 px-4">
                {(items.length > 0 ? items : [{ product_name: order.product_name, quantity: 1, product_price: order.product_price, variant_info: order.variant_info }]).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center group py-4 border-b border-zinc-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded bg-zinc-50 flex items-center justify-center font-black text-zinc-400 text-[10px]">
                        {item.quantity}x
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-800">{item.product_name}</span>
                        {item.variant_info && (item.variant_info.color || item.variant_info.size) && (
                          <span className="text-[10px] font-bold text-primary-600 mt-1">
                            {[item.variant_info.color, item.variant_info.size].filter(Boolean).join(' / ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-black text-zinc-900">{(Number(item.product_price || item.price || 0) * Number(item.quantity || 1)).toLocaleString()} ج.م</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 space-y-4 px-4">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-sm font-bold">المجموع الفرعي</span>
                  <span className="font-bold text-zinc-900">{productPrice.toLocaleString()} ج.م</span>
                </div>
                {discountPct > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="text-sm font-bold">خصم ({order.coupon_code || discountPct + '%'})</span>
                    <span className="font-bold">-{(productPrice * discountPct / 100).toLocaleString()} ج.م</span>
                  </div>
                )}
                {shippingCost > 0 && (
                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="text-sm font-bold">الشحن</span>
                    <span className="font-bold text-zinc-900">{shippingCost.toLocaleString()} ج.م</span>
                  </div>
                )}
                <div className="pt-6 border-t border-zinc-100 flex justify-between items-center">
                  <span className="text-lg font-black text-zinc-900">الإجمالي النهائي</span>
                  <span className="text-3xl font-black text-zinc-900" dir="ltr">{finalPrice.toLocaleString()} <span className="text-sm text-zinc-400">ج.م</span></span>
                </div>
              </div>
            </div>

            {(storeBranding?.invoice_instapay || storeBranding?.invoice_wallet) && (
              <div className="pt-16 border-t border-zinc-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {storeBranding?.invoice_instapay && (
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 hover:bg-zinc-100 transition-all group text-center sm:text-right">
                      <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-zinc-900 shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform shrink-0">
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
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 hover:bg-zinc-100 transition-all group text-center sm:text-right">
                      <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-zinc-900 shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform shrink-0">
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
                <div className="bg-zinc-50 p-8 rounded-3xl space-y-4">
                  <h4 className="text-sm font-black text-zinc-900">سياسات المتجر</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-bold whitespace-pre-wrap">{storeSettings.policies}</p>
                </div>
              </div>
            )}
          </div>
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
