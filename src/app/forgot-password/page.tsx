'use client'

import { useState } from 'react'
import { forgotPassword } from '@/app/actions/auth'
import { Mail, Loader2, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await forgotPassword(formData)

    if (res?.error) {
      setError(res.error)
    } else if (res?.success) {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-700">
          <div className="h-28 w-28 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-sky-100 border border-zinc-50 mb-4">
            <KeyRound className="h-12 w-12 text-sky-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">نسيت كلمة المرور؟</h1>
          <p className="text-zinc-500 font-bold text-xs mt-1 text-center">
            {success ? 'تحقق من بريدك الإلكتروني' : 'أدخل بريدك وسنرسل لك رابط التعيين'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {success ? (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-black text-zinc-900">تم إرسال الرسالة!</h2>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                  أرسلنا رابط إعادة تعيين كلمة المرور إلى{' '}
                  <span className="font-bold text-zinc-700">{email}</span>
                </p>
                <p className="text-xs text-zinc-400 font-medium">
                  تحقق من مجلد البريد العشوائي (Spam) إذا لم تجد الرسالة
                </p>
              </div>
              <Link
                href="/login"
                className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
              >
                <ArrowRight className="h-5 w-5" />
                العودة لتسجيل الدخول
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

              <div className="space-y-2">
                <label className="block text-sm font-bold text-zinc-700">
                  البريد الإلكتروني للحساب
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="merchant@example.com"
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
                    إرسال رابط الاستعادة
                    <ArrowRight className="h-5 w-5 rotate-180" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-zinc-500 text-sm font-bold hover:text-zinc-900 transition-colors flex items-center justify-center gap-1">
              <ArrowRight className="h-4 w-4" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
