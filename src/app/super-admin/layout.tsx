import { createClient } from '@/lib/supabase/server'
import { assertSuperAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, Users, CreditCard, Settings, 
  LogOut, ShieldCheck, Store, Activity, Globe, Palette
} from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  try {
    await assertSuperAdmin(supabase)
  } catch (error) {
    redirect('/login')
  }

  const navItems = [
    { href: '/super-admin', label: 'نظرة عامة', icon: LayoutDashboard },
    { href: '/super-admin/upgrade-requests', label: 'طلبات الترقية', icon: CreditCard },
    { href: '/super-admin/merchants', label: 'إدارة المتاجر', icon: Store },
    { href: '/super-admin/plans', label: 'الاشتراكات والأسعار', icon: Settings },
    { href: '/super-admin/settings', label: 'إعدادات المنصة', icon: Globe },
    { href: '/super-admin/themes', label: 'إدارة الثيمات', icon: Palette },
    { href: '/super-admin/analytics', label: 'الإحصائيات', icon: Activity },
  ]

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-l border-slate-200 flex flex-col fixed inset-y-0 right-0 z-50">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-1">
             <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                <ShieldCheck className="h-6 w-6 text-white" />
             </div>
             <div className="flex flex-col">
                <span className="text-lg font-black text-slate-900 tracking-tight leading-none">Kaya Admin</span>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Platform Control</span>
             </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-[0.98] group"
            >
              <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
           <LogoutButton className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mr-72 p-10">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
          {children}
        </div>
      </main>
    </div>
  )
}
