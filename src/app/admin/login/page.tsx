'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Store } from 'lucide-react'
import Link from 'next/link'

import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-zinc-50 to-white px-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -top-20 -right-20 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-20 -left-20 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl bg-white p-10 shadow-2xl shadow-zinc-100 border border-zinc-100">
          {/* Logo */}
          <div className="mb-10 text-center flex flex-col items-center">
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
            <p className="text-zinc-500 font-bold text-xs mt-1">لوحة تحكم المدير</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2" dir="ltr">
              <label className="block text-right text-sm font-semibold text-zinc-700">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2" dir="ltr">
              <label className="block text-right text-sm font-semibold text-zinc-700">
                كلمة المرور
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 text-right">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-zinc-900 py-3.5 text-base font-bold text-white shadow-lg shadow-zinc-200 transition hover:bg-zinc-800 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
            >
              {loading ? 'جارٍ التحقق...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/register" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
              ليس لديك حساب؟ أنشئ متجرك الآن
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
