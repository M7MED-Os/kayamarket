'use client'

import { useState } from 'react'
import { login } from '@/app/actions/auth'
import { Lock, Mail, Loader2, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'

import { KayaLogo } from '@/components/common/KayaLogo'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const res = await login(formData)
    
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-50/50 via-zinc-50 to-white flex items-center justify-center p-6 selection:bg-sky-100 selection:text-sky-900" dir="rtl">
      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Logo / Header Area */}
        <div className="flex flex-col items-center mb-12">
          <Link href="/" className="group relative">
            <div className="absolute inset-0 bg-sky-500/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative h-24 w-24 bg-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(14,165,233,0.1)] border border-white/50 mb-6 hover:scale-105 active:scale-95 transition-all duration-500">
              <KayaLogo className="h-14 w-14 text-sky-500" iconOnly />
            </div>
          </Link>
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tight flex items-center justify-center" dir="ltr">
              <span className="text-sky-500">Kaya</span>
              <span className="text-slate-400 font-normal">Market</span>
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-zinc-200" />
              <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em]">لوحة تحكم المتجر</p>
              <div className="h-[1px] w-8 bg-zinc-200" />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-sky-500/10 transition-colors duration-700" />
          
          <form onSubmit={handleSubmit} className="relative space-y-6">
            
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-5 py-4 rounded-2xl text-xs font-black text-center animate-in zoom-in duration-300 flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-zinc-400 mr-2 uppercase tracking-widest">البريد الإلكتروني</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-zinc-300 group-focus-within/input:text-sky-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@example.com"
                  className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all duration-300"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest">كلمة المرور</label>
                <Link href="/forgot-password" className="text-[10px] text-sky-500 hover:text-sky-600 font-black transition-colors">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative group/input">
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-zinc-300 group-focus-within/input:text-sky-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all duration-300"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white rounded-2xl py-5 font-black text-sm flex items-center justify-center gap-3 hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xl shadow-zinc-200 disabled:opacity-70 group/btn"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  الدخول للوحة التحكم
                  <ArrowRight className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-zinc-50 relative">
            <p className="text-zinc-400 text-xs font-bold">
              ليس لديك متجر بعد؟{' '}
              <Link href="/register" className="text-zinc-900 font-black hover:text-sky-500 transition-colors">
                أنشئ متجرك الآن
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:gap-3">
            <ArrowRight className="h-3 w-3" />
            العودة للمنصة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
