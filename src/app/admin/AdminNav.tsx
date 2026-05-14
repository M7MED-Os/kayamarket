'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { 
  LayoutDashboard, ShoppingCart, Package, Settings, ExternalLink, 
  Ticket, Layout, Palette, Globe, CreditCard, Shield, MessageSquare, Star,
  Menu, X, LayoutGrid, LogOut, Activity
} from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

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
    { label: 'التتبع والتحليلات', tab: 'tracking', icon: Activity },
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
              href={`https://wa.me/201124417693?text=${encodeURIComponent('مرحباً، أحتاج إلى مساعدة في إعدادات متجري على كايا ماركت.')}`}
              target="_blank"
              className="flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-emerald-600 hover:bg-emerald-50 transition-all group border border-emerald-100 bg-white shadow-sm mb-2"
            >
              <svg className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.655zm6.757-4.047c1.513.897 3.01 1.348 4.636 1.349 5.38 0 9.756-4.376 9.756-9.756 0-2.608-1.016-5.059-2.859-6.903-1.841-1.841-4.29-2.857-6.895-2.857-5.378 0-9.754 4.377-9.754 9.756 0 2.008.618 3.518 1.691 5.31l-1.006 3.673 3.766-.988zM17.202 14.18c-.284-.143-1.681-.83-1.944-.925-.262-.096-.453-.143-.645.143-.191.286-.74.925-.907 1.117-.167.191-.334.215-.618.072-.284-.143-1.198-.442-2.283-1.411-.844-.753-1.413-1.683-1.579-1.97-.167-.286-.018-.441.124-.582.128-.127.284-.334.426-.502.142-.167.19-.286.284-.477.095-.19.047-.358-.024-.502-.071-.143-.645-1.551-.882-2.124-.231-.557-.466-.481-.645-.49-.167-.008-.358-.01-.55-.01s-.502.072-.765.358c-.262.286-1.003.979-1.003 2.388s1.026 2.769 1.169 2.96c.143.191 2.019 3.083 4.891 4.324.683.295 1.216.471 1.632.604.686.218 1.311.187 1.804.113.55-.083 1.68-.686 1.919-1.349.239-.663.239-1.233.167-1.349-.071-.117-.262-.19-.546-.334z"/>
              </svg>
              <span className="font-inter text-base">مساعدة فورية</span>
            </Link>

            <Link
              href={`/store/${storeSlug}`}
              target="_blank"
              className="flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sky-600 hover:bg-sky-50 transition-all group border border-slate-100 hover:border-sky-200 bg-white shadow-sm mb-2"
            >
              <ExternalLink className="h-6 w-6 text-sky-500 group-hover:scale-110 transition-transform" />
              <span className="font-inter text-base">معاينة المتجر</span>
            </Link>

            <LogoutButton className="flex items-center justify-start gap-4 w-full px-6 py-4 rounded-2xl font-black text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100 hover:border-rose-100 group bg-white shadow-sm">
              <LogOut className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              <span className="font-inter text-base">تسجيل الخروج</span>
            </LogoutButton>
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
