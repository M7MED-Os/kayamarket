'use client'

import { useState } from 'react'
import { resetPassword } from '@/app/actions/auth'
import { Lock, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await resetPassword(formData)

    if (res?.error) {
      setError(res.error)
    } else if (res?.success) {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-700">
          <div className="h-28 w-28 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-sky-100 border border-zinc-50 mb-4">
            <Lock className="h-12 w-12 text-sky-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">تعيين كلمة مرور جديدة</h1>
          <p className="text-zinc-500 font-bold text-xs mt-1">أدخل كلمة المرور الجديدة لحسابك</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {success ? (
            /* Success */
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-black text-zinc-900">تم تحديث كلمة المرور!</h2>
                <p className="text-sm text-zinc-500 font-medium">
                  سيتم تحويلك تلقائياً لصفحة تسجيل الدخول خلال ثوانٍ...
                </p>
              </div>
              <Link
                href="/login"
                className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
              >
                تسجيل الدخول الآن
              </Link>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold text-center">
                  {error}
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-zinc-700">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength={8}
                    placeholder="8 أحرف على الأقل"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-12 text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-400 font-medium px-1">يجب أن تكون 8 أحرف على الأقل</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-zinc-700">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    placeholder="أعد إدخال كلمة المرور"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-12 text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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
                    تحديث كلمة المرور
                    <ArrowRight className="h-5 w-5 rotate-180" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
