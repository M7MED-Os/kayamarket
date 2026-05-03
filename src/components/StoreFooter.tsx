'use client'

import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import { getPlanConfig } from '@/lib/subscription'

export default function StoreFooter({ store, branding, slug }: { store: any; branding: any; slug: string }) {
  const logoSrc = branding?.logo_url || null
  const address = branding?.address || store?.address || null
  const planConfig = getPlanConfig(store?.plan)

  return (
    <footer id="contact" className="bg-zinc-950 text-white pt-10 pb-6">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12" dir="rtl">
          <div className="text-right">
            <div className="flex items-center gap-3 mb-1">
              {logoSrc ? (
                <div className="h-12 w-12 rounded-xl bg-white p-1.5 overflow-hidden shadow-lg shrink-0">
                  <img src={logoSrc} alt="Logo" className="h-full w-full object-contain" />
                </div>
              ) : (
                <span className="text-2xl font-black tracking-tighter" style={{ color: 'var(--primary)' }}>{store?.name}</span>
              )}
              {logoSrc && <span className="text-lg font-black">{store?.name}</span>}
            </div>
            <p className="text-zinc-400 text-sm leading-7 max-w-xs">{branding?.footer_description || branding?.tagline || 'شكراً لتعاملكم معنا'}</p>
          </div>

          <div className="text-right">
            <h4 className="text-lg font-bold text-white mb-8 border-r-4 pr-4" style={{ borderColor: 'var(--primary)' }}>روابط سريعة</h4>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li><Link href={`/store/${slug}/products`} className="font-semibold hover:text-white transition-colors">جميع المنتجات</Link></li>
              <li><Link href={`/store/${slug}/track`} className="font-semibold hover:text-white transition-colors">تتبع طلبك</Link></li>
              <li><Link href={`/store/${slug}/#contact`} className="font-semibold hover:text-white transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>

          <div className="text-right">
            <h4 className="text-lg font-bold text-white mb-8 border-r-4 pr-4" style={{ borderColor: 'var(--primary)' }}>تواصل معنا</h4>
            <div className="space-y-6">
              {address && (
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800" style={{ color: 'var(--primary)' }}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-white">العنوان</p>
                    <p className="mt-0.5 text-zinc-500">{address}</p>
                  </div>
                </div>
              )}
              {store?.whatsapp_phone && (
                <a href={`https://wa.me/${store.whatsapp_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-green-500 group-hover:bg-green-600 group-hover:text-white transition-all">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-white">واتساب</p>
                    <p className="mt-0.5 text-zinc-500" dir="ltr">{store.whatsapp_phone}</p>
                  </div>
                </a>
              )}
              {branding?.facebook_url && (
                <a href={branding.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-blue-500 group-hover:bg-[#1877F2] group-hover:text-white transition-all">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-white">فيسبوك</p>
                    <p className="mt-0.5 text-zinc-500">تابعونا على صفحتنا</p>
                  </div>
                </a>
              )}
              {branding?.instagram_url && (
                <a href={branding.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-pink-500 group-hover:bg-gradient-to-tr group-hover:from-yellow-400 group-hover:via-pink-500 group-hover:to-purple-500 group-hover:text-white transition-all">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path></svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-white">إنستجرام</p>
                    <p className="mt-0.5 text-zinc-500">شاهد أجمل اللقطات</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="pt-8 mt-4 border-t border-white/5 text-center flex flex-col items-center gap-5">
          {!planConfig.canRemoveWatermark && (
            <a href="https://kayamarket.com" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 bg-zinc-900/40 hover:bg-zinc-800 transition-all duration-300 px-5 py-2.5 rounded-2xl border border-zinc-800/50 hover:border-sky-500/30 shadow-sm">
              <span className="text-zinc-400 text-xs font-bold group-hover:text-zinc-300 transition-colors">بكل فخر، صُنع بواسطة</span>
              <div className="flex items-center gap-1.5 text-white">
                <svg viewBox="0 0 100 100" fill="none" className="h-5 w-5 text-sky-500 group-hover:scale-110 transition-transform duration-300">
                  <path d="M15 50 C15 30.67 30.67 15 50 15 C69.33 15 85 30.67 85 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  <path d="M85 50 C85 69.33 69.33 85 50 85 C30.67 85 15 69.33 15 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  <path d="M30 35 L30 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  <path d="M50 50 L50 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  <path d="M35 30 L50 50 L65 30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M70 35 L70 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                </svg>
                <span className="font-black font-poppins tracking-tighter text-sm group-hover:text-sky-50 transition-colors duration-300">KayaMarket</span>
              </div>
            </a>
          )}
          <p className="text-zinc-600 text-[11px] font-black tracking-wide">© {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
