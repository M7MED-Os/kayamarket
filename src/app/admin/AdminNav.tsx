'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { 
  LayoutDashboard, ShoppingCart, Package, Settings, ExternalLink, 
  Ticket, Layout, Palette, Globe, CreditCard, Shield, MessageSquare, Star,
  Menu, X, LayoutGrid
} from 'lucide-react'

interface AdminNavProps {
  storeSlug: string | null
}

export default function AdminNav({ storeSlug }: AdminNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'builder'

  const navItems = [
    { label: 'الرئيسية', href: '/admin', icon: LayoutDashboard },
    { label: 'الطلبات', href: '/admin/orders', icon: ShoppingCart },
    { label: 'المنتجات', href: '/admin/products', icon: Package },
    { label: 'التقييمات', href: '/admin/reviews', icon: Star },
    { label: 'الكوبونات', href: '/admin/coupons', icon: Ticket },
    { label: 'الإعدادات', href: '/admin/settings', icon: Settings },
  ]

  const settingsSubItems = [
    { label: 'تنسيق المتجر', tab: 'builder', icon: Layout },
    { label: 'القوالب', tab: 'themes', icon: Palette },
    { label: 'الألوان والخطوط', tab: 'branding', icon: Palette },
    { label: 'الشعار والبانر', tab: 'media', icon: Globe },
    { label: 'المعلومات', tab: 'identity', icon: MessageSquare },
    { label: 'الدفع', tab: 'checkout', icon: CreditCard },
    { label: 'الخطة', tab: 'plan', icon: Shield },
  ]

  return (
    <>
      {/* ── Desktop Sidebar Navigation ────────────────────────────────────── */}
      <nav className="hidden xl:flex flex-col w-full px-6 py-8 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          const isSettings = item.href === '/admin/settings'

          return (
            <div key={item.href} className="flex flex-col gap-1">
              <Link
                href={item.href}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-sky-500 text-white font-black shadow-lg shadow-sky-200'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-bold'
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-inter text-base">{item.label}</span>
              </Link>

              {/* Sub-items for Settings (Desktop Only) */}
              {isSettings && isActive && (
                <div className="flex flex-col gap-1 pr-9 mt-1 border-r-2 border-sky-100 mr-4 animate-in slide-in-from-right-2 duration-300">
                  {settingsSubItems.map(sub => (
                    <Link
                      key={sub.tab}
                      href={`/admin/settings?tab=${sub.tab}`}
                      className={`flex items-center gap-4 py-3 text-sm font-black transition-colors ${
                        activeTab === sub.tab
                          ? 'text-sky-600'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <sub.icon className="h-4 w-4" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        
        {storeSlug && (
          <div className="pt-6 mt-4 border-t border-slate-100">
            <Link
              href={`/store/${storeSlug}`}
              target="_blank"
              className="flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sky-600 hover:bg-sky-50 transition-all group border border-slate-100 hover:border-sky-200 bg-white shadow-sm"
            >
              <ExternalLink className="h-6 w-6 text-sky-500 group-hover:scale-110 transition-transform" />
              <span className="font-inter text-base">معاينة المتجر</span>
            </Link>
          </div>
        )}
      </nav>

      {/* ── Mobile Bottom Navigation (Icons Only) ─────────────────────────── */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-200 z-50 flex justify-between items-center px-2 pb-safe-bottom h-16 shadow-[0_-8px_40px_rgba(0,0,0,0.08)]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center justify-center flex-1 h-full transition-all duration-500 ${
                isActive ? 'text-sky-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-2.5 rounded-2xl transition-all duration-500 ${
                isActive 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-200 scale-105 -translate-y-1' 
                  : 'bg-transparent'
              }`}>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute bottom-1.5 h-1 w-1 bg-sky-500 rounded-full animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
