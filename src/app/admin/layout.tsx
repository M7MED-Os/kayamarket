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

  // 🕒 Global Platform Settings
  const { data: platformSettings } = await supabase.from('platform_settings').select('*').single()
  const graceDays = platformSettings?.grace_period_days || 3

  // 🕒 Automatic Downgrade Check (Grace Period Aware)
  if (store?.plan !== 'starter' && store?.plan_expires_at) {
    const expiryDate = new Date(store.plan_expires_at)
    const graceLimit = new Date(expiryDate)
    graceLimit.setDate(expiryDate.getDate() + graceDays)

    if (graceLimit < new Date()) {
      // Grace period expired! Downgrade using Admin Client, but leave plan_expires_at as a marker for Deep Cleanup
      const admin = createAdminClient()
      await admin.from('stores').update({ plan: 'starter' }).eq('id', storeId)
      redirect('/admin/settings?expired=true')
    }
  }

  const storeName = store?.name || 'لوحة تحكم المتجر'
  const storeSlug = store?.slug || null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col xl:flex-row font-sans selection:bg-sky-100 selection:text-sky-900" dir="rtl">
      
      {/* ── Sidebar (Desktop) ───────────────────────────────────────────── */}
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

        {/* Navigation Area */}
        <div className="flex-1 flex flex-col">
          <AdminNav storeSlug={storeSlug} />

          <div className="p-8 mt-auto border-t border-slate-50">
            <LogoutButton className="flex items-center justify-center gap-3 w-full px-4 py-5 rounded-2xl font-black text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100 group shadow-sm hover:shadow-md">
              <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              تسجيل الخروج
            </LogoutButton>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header (Tablets & Phones) ───────────────────────────── */}
      <header className="xl:hidden sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <KayaLogo className="h-8 w-8" />
        </Link>

        <div className="flex items-center gap-3">
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
          {/* Dynamic Alerts */}
          <SubscriptionAlert 
            planExpiresAt={store?.plan_expires_at} 
            gracePeriodDays={graceDays} 
            currentPlan={store?.plan || 'starter'} 
          />
          {children}
        </div>
      </main>

      <div className="xl:hidden">
        <AdminNav storeSlug={storeSlug} />
      </div>
    </div>
  )
}
