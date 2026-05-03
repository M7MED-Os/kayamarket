import { ReactNode } from 'react'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import AdminNav from './AdminNav'
import { Store, LogOut, LayoutGrid } from 'lucide-react'
import { PlanTier } from '@/lib/subscription'

const KayaLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15 50 C15 30.67 30.67 15 50 15 C69.33 15 85 30.67 85 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M85 50 C85 69.33 69.33 85 50 85 C30.67 85 15 69.33 15 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M30 35 L30 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M50 50 L50 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M35 30 L50 50 L65 30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M70 35 L70 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
  </svg>
)

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
    .select('name, slug, plan, plan_expires_at')
    .eq('id', storeId)
    .single()

  // 🕒 Automatic Downgrade Check
  if (store?.plan !== 'starter' && store?.plan_expires_at) {
    const expiryDate = new Date(store.plan_expires_at)
    if (expiryDate < new Date()) {
      // Plan expired! Downgrade using Admin Client to bypass RLS
      const admin = createAdminClient()
      await admin.from('stores').update({ plan: 'starter', plan_expires_at: null }).eq('id', storeId)
      // Refresh context or redirect
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
          <div className="flex items-center gap-4 text-sky-500">
            <KayaLogo className="h-10 w-10 shrink-0 shadow-sm" />
            <span className="text-3xl font-black font-poppins text-slate-900 tracking-tight">
              Kaya<span className="text-slate-400 font-bold">Market</span>
            </span>
          </div>

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
        <div className="flex items-center gap-3 text-sky-500">
          <KayaLogo className="h-8 w-8" />
          <span className="text-xl font-black font-poppins text-slate-900 tracking-tighter">KayaMarket</span>
        </div>
        {storeSlug ? (
          <>
            <style>{`
              @keyframes storePulse {
                0% { background-color: #f8fafc; color: #0ea5e9; box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4); }
                50% { background-color: #0ea5e9; color: #ffffff; box-shadow: 0 0 0 8px rgba(14, 165, 233, 0); transform: scale(1.05); }
                100% { background-color: #f8fafc; color: #0ea5e9; box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
              }
            `}</style>
            <a 
              href={`/store/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              title="زيارة المتجر"
              className="group relative h-10 w-10 rounded-full border border-sky-200 flex items-center justify-center overflow-hidden active:scale-90 shadow-sm"
              style={{ animation: 'storePulse 3s infinite' }}
            >
               <Store className="h-5 w-5 relative z-10" />
            </a>
          </>
        ) : (
          <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
             <Store className="h-5 w-5" />
          </div>
        )}
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-full p-6 md:p-10 lg:p-12 pb-32 xl:pb-12 overflow-x-hidden min-h-screen relative z-10 xl:z-auto">
        <div className="w-full">
          {children}
        </div>
      </main>

      <div className="xl:hidden">
        <AdminNav storeSlug={storeSlug} />
      </div>
    </div>
  )
}
