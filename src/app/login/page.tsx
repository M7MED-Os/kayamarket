'use client'

import { useState } from 'react'
import { login } from '@/app/actions/auth'
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-700">
          <div className="h-28 w-28 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-sky-100 border border-zinc-50 mb-4 hover:scale-105 transition-transform duration-500">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-20 w-20">
              <path d="M15 50 C15 30.67 30.67 15 50 15 C69.33 15 85 30.67 85 50" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
              <path d="M85 50 C85 69.33 69.33 85 50 85 C30.67 85 15 69.33 15 50" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
              <path d="M30 35 L30 65" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
              <path d="M50 50 L50 70" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
              <path d="M35 30 L50 50 L65 30" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M70 35 L70 65" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">KayaMarket</h1>
          <p className="text-zinc-500 font-bold text-xs mt-1">لوحة تحكم المتجر</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@example.com"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-4 pr-12 text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-4 pr-12 text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  الدخول للوحة التحكم
                  <ArrowRight className="h-5 w-5 rotate-180" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-500 text-sm font-medium">
              ليس لديك متجر بعد؟{' '}
              <Link href="/register" className="text-zinc-900 font-bold hover:underline">
                أنشئ متجرك الآن
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-zinc-500 hover:text-zinc-900 text-sm font-bold transition-colors">
            العودة للمنصة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
