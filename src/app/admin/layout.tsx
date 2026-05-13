import { ReactNode } from 'react'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import AdminNav from './AdminNav'
import { KayaLogo } from '@/components/common/KayaLogo'
import { Store, LogOut, LayoutGrid } from 'lucide-react'
import { PlanTier } from '@/lib/subscription'
import SubscriptionAlert from '@/components/SubscriptionAlert'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  let storeId: string

  try {
    const authData = await assertMerchant(supabase)
    storeId = authData.storeId
  } catch (error) {
    redirect('/login')
  }

  const { data: store } = await supabase
    .from('stores')
    .select('name, slug, plan, plan_expires_at, last_renewed_at, created_at')
    .eq('id', storeId)
    .single()

  const { data: platformSettings } = await supabase.from('platform_settings').select('*').single()
  const graceDays = platformSettings?.grace_period_days || 3

  if (store?.plan !== 'starter' && store?.plan_expires_at) {
    const expiryDate = new Date(store.plan_expires_at)
    const graceLimit = new Date(expiryDate)
    graceLimit.setDate(expiryDate.getDate() + graceDays)

    if (graceLimit < new Date()) {
      const admin = createAdminClient()
      await admin.from('stores').update({ plan: 'starter' }).eq('id', storeId)
      redirect('/admin/settings?expired=true')
    }
  }

  const storeName = store?.name || 'لوحة تحكم المتجر'
  const storeSlug = store?.slug || null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col xl:flex-row font-sans selection:bg-sky-100 selection:text-sky-900" dir="rtl">
      
      {/* ── Sidebar (Desktop Only) ───────────────────────────────────────────── */}
      <aside className="hidden xl:flex w-80 bg-white border-l border-slate-200 flex-col shrink-0 sticky top-0 h-screen z-40 overflow-y-auto no-scrollbar">
        {/* Brand Header */}
        <div className="p-8 border-b border-slate-50 flex flex-col items-start gap-10">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <KayaLogo className="h-10 w-10 shrink-0" />
          </Link>

          <div className="flex flex-col w-full">
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-3 font-inter">المتجر الحالي</span>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner group transition-all hover:bg-white hover:border-sky-100 hover:shadow-sky-100/50">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-sky-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Store className="h-6 w-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="text-base font-black text-slate-900 font-inter truncate leading-tight">{storeName}</h1>
                <span className="text-xs font-bold text-slate-400 mt-0.5">لوحة التحكم</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="flex-1">
          <AdminNav storeSlug={storeSlug} />
        </div>
      </aside>

      {/* ── Mobile Navigation (Visible only on mobile/tablet) ────────────────── */}
      <div className="xl:hidden">
        <AdminNav storeSlug={storeSlug} />
      </div>

      {/* ── Mobile Header ───────────────────────────────────────────── */}
      <header className="xl:hidden sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <KayaLogo className="h-8 w-8" />
        </Link>

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/201124417693?text=${encodeURIComponent('مرحباً، أحتاج إلى مساعدة في إعدادات متجري على كايا ماركت.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 active:scale-95 transition-all shadow-sm"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.655zm6.757-4.047c1.513.897 3.01 1.348 4.636 1.349 5.38 0 9.756-4.376 9.756-9.756 0-2.608-1.016-5.059-2.859-6.903-1.841-1.841-4.29-2.857-6.895-2.857-5.378 0-9.754 4.377-9.754 9.756 0 2.008.618 3.518 1.691 5.31l-1.006 3.673 3.766-.988zM17.202 14.18c-.284-.143-1.681-.83-1.944-.925-.262-.096-.453-.143-.645.143-.191.286-.74.925-.907 1.117-.167.191-.334.215-.618.072-.284-.143-1.198-.442-2.283-1.411-.844-.753-1.413-1.683-1.579-1.97-.167-.286-.018-.441.124-.582.128-.127.284-.334.426-.502.142-.167.19-.286.284-.477.095-.19.047-.358-.024-.502-.071-.143-.645-1.551-.882-2.124-.231-.557-.466-.481-.645-.49-.167-.008-.358-.01-.55-.01s-.502.072-.765.358c-.262.286-1.003.979-1.003 2.388s1.026 2.769 1.169 2.96c.143.191 2.019 3.083 4.891 4.324.683.295 1.216.471 1.632.604.686.218 1.311.187 1.804.113.55-.083 1.68-.686 1.919-1.349.239-.663.239-1.233.167-1.349-.071-.117-.262-.19-.546-.334z"/>
            </svg>
          </a>
          {storeSlug && (
            <Link
              href={`/store/${storeSlug}`}
              target="_blank"
              className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 relative group active:scale-95 transition-all"
            >
              <div className="absolute inset-0 bg-sky-500 rounded-full opacity-10 animate-ping" />
              <Store className="h-5 w-5 relative z-10 group-hover:text-sky-500 transition-colors" />
            </Link>
          )}
          <LogoutButton className="h-10 w-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 active:scale-95 transition-all">
            <LogOut className="h-5 w-5" />
          </LogoutButton>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-full p-6 md:p-10 lg:p-12 pb-32 xl:pb-12 overflow-x-hidden min-h-screen relative z-10 xl:z-auto">
        <div className="w-full space-y-6">
          <SubscriptionAlert 
            planExpiresAt={store?.plan_expires_at} 
            gracePeriodDays={graceDays} 
            currentPlan={store?.plan || 'starter'} 
          />
          {children}
        </div>
      </main>

    </div>
  )
}
