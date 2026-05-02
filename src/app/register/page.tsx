'use client'

import { useState } from 'react'
import { registerMerchant } from '@/app/actions/auth'
import { Mail, Lock, User, Loader2, ArrowRight, CheckCircle2, Inbox, Store, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState('')

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlug(val)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await registerMerchant(formData)

    if (res?.error) {
      setError(res.error)
      setStatus(res.status || null)
      setLoading(false)
    } else if (res?.success) {
      setSuccess(res.message || 'تمت العملية بنجاح')
      setStatus(res.status || null)
      setLoading(false)
    }
  }

  // Logo Component
  const KayaLogo = () => (
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
      <div className="h-1 w-12 bg-sky-500 rounded-full mt-2 opacity-20" />
    </div>
  )

  if (status === 'pending_verification') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-zinc-200 border border-white relative overflow-hidden">
            <KayaLogo />
            <div className="relative">
              <div className="mx-auto h-20 w-20 bg-sky-50 rounded-3xl flex items-center justify-center mb-6 text-sky-500">
                <Inbox className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 mb-4">تفقد بريدك الإلكتروني</h2>
              <p className="text-zinc-500 font-medium leading-relaxed mb-8 px-4 text-sm">
                {success || 'لقد أرسلنا لك رابط التفعيل. يرجى الضغط عليه لتفعيل متجرك والبدء في استخدامه.'}
              </p>
              <Link href="/login" className="block w-full bg-zinc-900 text-white rounded-2xl py-4 font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200">
                الذهاب لصفحة تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 selection:bg-sky-100 selection:text-sky-900" dir="rtl">
      <div className="w-full max-w-md">
        <KayaLogo />

        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-zinc-200/50 border border-white relative overflow-hidden">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-out ${step >= 1 ? 'bg-sky-500 shadow-sm shadow-sky-200' : 'bg-zinc-100'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-out ${step >= 2 ? 'bg-sky-500 shadow-sm shadow-sky-200' : 'bg-zinc-100'}`} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-black text-center animate-shake">
                {error}
              </div>
            )}

            {/* STEP 1: Personal Info */}
            <div className={`space-y-5 animate-in fade-in slide-in-from-left-4 duration-500 ${step !== 1 ? 'hidden' : ''}`}>
              <div className="text-right mb-6 px-1">
                <h2 className="text-xl font-black text-zinc-900">إنشاء حساب جديد</h2>
                <p className="text-[10px] font-black text-zinc-400 mt-1 uppercase tracking-wider">الخطوة 1: البيانات الشخصية</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 mb-2 px-1 uppercase tracking-widest">الاسم بالكامل</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-300 group-focus-within:text-sky-500 transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                    <input type="text" name="fullName" required={step === 1} placeholder="محمد أحمد" className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-4 pr-12 text-zinc-900 outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all font-bold text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 mb-2 px-1 uppercase tracking-widest">البريد الإلكتروني</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-300 group-focus-within:text-sky-500 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input type="email" name="email" required={step === 1} placeholder="admin@example.com" className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-4 pr-12 text-zinc-900 outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all font-bold text-sm" dir="ltr" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 mb-2 px-1 uppercase tracking-widest">كلمة المرور</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-300 group-focus-within:text-sky-500 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input type="password" name="password" required={step === 1} placeholder="••••••••" minLength={6} className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-4 pr-12 text-zinc-900 outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all font-bold text-sm" dir="ltr" />
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setStep(2)} className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 group">
                الخطوة التالية
                <ArrowRight className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>

            {/* STEP 2: Store Info */}
            <div className={`space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 ${step !== 2 ? 'hidden' : ''}`}>
              <div className="text-right mb-6 px-1">
                <h2 className="text-xl font-black text-zinc-900">إعداد المتجر</h2>
                <p className="text-[10px] font-black text-zinc-400 mt-1 uppercase tracking-wider">الخطوة 2: هوية المتجر</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 mb-2 px-1 uppercase tracking-widest">اسم المتجر</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-300 group-focus-within:text-sky-500 transition-colors">
                      <Store className="h-5 w-5" />
                    </div>
                    <input type="text" name="storeName" required={step === 2} placeholder="مثال: متجر النجمة" className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-4 pr-12 text-zinc-900 outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all font-bold text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 mb-2 px-1 uppercase tracking-widest">رابط المتجر</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-300 group-focus-within:text-sky-500 transition-colors font-black text-[10px]">
                      URL
                    </div>
                    <input type="text" name="slug" required={step === 2} value={slug} onChange={handleSlugChange} placeholder="my-store-link" className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-4 pr-12 text-zinc-900 outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all font-bold text-sm" dir="ltr" />
                  </div>
                  <p className="mt-2 text-[10px] text-zinc-400 font-black text-left px-2" dir="ltr">
                    kayamarket.com/store/<span className="text-sky-500">{slug || 'your-link'}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center h-14 w-14 bg-zinc-50 text-zinc-400 rounded-2xl hover:bg-zinc-100 transition-all border border-zinc-100">
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-zinc-900 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 disabled:opacity-70 group">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      إطلاق المتجر الآن
                      <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform text-sky-400" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-zinc-50">
            <p className="text-zinc-500 text-xs font-bold">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-sky-500 font-black hover:text-sky-600 transition-colors">تسجيل الدخول</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center pb-4">
          <Link href="/" className="text-zinc-400 hover:text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
            العودة للمنصة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
