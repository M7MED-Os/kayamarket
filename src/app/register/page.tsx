'use client'

import { useState, useRef } from 'react'
import { registerMerchant } from '@/app/actions/auth'
import { 
  Mail, Lock, User, Loader2, ArrowRight, CheckCircle2, 
  Inbox, Store, ArrowLeft, Sparkles, AlertCircle 
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

import { KayaLogo as KayaLogoIcon } from '@/components/common/KayaLogo'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState('')

  // Refs for focusing
  const fullNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const storeNameRef = useRef<HTMLInputElement>(null)
  const slugRef = useRef<HTMLInputElement>(null)

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlug(val)
  }

  const validateStep1 = (formData: FormData) => {
    if (!formData.get('fullName')) {
      toast.error('يرجى إدخال الاسم بالكامل')
      fullNameRef.current?.focus()
      return false
    }
    if (!formData.get('email')) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      emailRef.current?.focus()
      return false
    }
    const email = formData.get('email') as string
    if (!email.includes('@')) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح')
      emailRef.current?.focus()
      return false
    }
    if (!formData.get('password') || (formData.get('password') as string).length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      passwordRef.current?.focus()
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    
    // Final validation
    if (step === 1) {
      if (!validateStep1(formData)) return
      setStep(2)
      return
    }

    if (!formData.get('storeName')) {
      toast.error('يرجى إدخال اسم المتجر')
      storeNameRef.current?.focus()
      return
    }
    if (!formData.get('slug')) {
      toast.error('يرجى إدخال رابط المتجر')
      slugRef.current?.focus()
      return
    }

    setLoading(true)
    setError(null)

    const res = await registerMerchant(formData)

    if (res?.error) {
      setError(res.error)
      toast.error(res.error)
      setStatus(res.status || null)
      setLoading(false)
    } else if (res?.success) {
      setSuccess(res.message || 'تمت العملية بنجاح')
      toast.success('تم إنشاء الحساب بنجاح! تفقد بريدك لتفعيله.')
      setStatus(res.status || null)
      setLoading(false)
    }
  }

  // Logo Component
  const KayaLogo = () => (
    <div className="flex flex-col items-center mb-12 animate-in fade-in zoom-in duration-1000">
      <Link href="/" className="group relative">
        <div className="absolute inset-0 bg-sky-500/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative h-24 w-24 bg-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(14,165,233,0.1)] border border-white/50 mb-6 hover:scale-105 active:scale-95 transition-all duration-500">
          <KayaLogoIcon className="h-14 w-14 text-sky-500" iconOnly />
        </div>
      </Link>
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tight flex items-center justify-center" dir="ltr">
          <span className="text-sky-500">Kaya</span>
          <span className="text-slate-400 font-normal">Market</span>
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div className="h-[1px] w-6 bg-zinc-200" />
          <p className="text-zinc-400 font-bold text-[9px] uppercase tracking-[0.3em]">إطلاق علامتك التجارية</p>
          <div className="h-[1px] w-6 bg-zinc-200" />
        </div>
      </div>
    </div>
  )

  if (status === 'pending_verification') {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-50/50 via-zinc-50 to-white flex items-center justify-center p-6 selection:bg-sky-100 selection:text-sky-900" dir="rtl">
        <div className="w-full max-w-[440px] text-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden">
            <KayaLogo />
            <div className="relative space-y-6">
              <div className="mx-auto h-20 w-20 bg-sky-50 rounded-[2rem] flex items-center justify-center mb-6 text-sky-500 shadow-inner">
                <Inbox className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900">تفقد بريدك الإلكتروني</h2>
              <p className="text-zinc-500 font-bold leading-relaxed text-xs">
                {success || 'لقد أرسلنا لك رابط التفعيل. يرجى الضغط عليه لتفعيل متجرك والبدء في استخدامه.'}
              </p>
              <Link href="/login" className="block w-full bg-zinc-900 text-white rounded-2xl py-5 font-black text-sm hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-[0.98]">
                الذهاب لصفحة تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-50/50 via-zinc-50 to-white flex items-center justify-center p-6 selection:bg-sky-100 selection:text-sky-900" dir="rtl">
      <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <KayaLogo />

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-sky-500/10 transition-colors duration-700" />
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-3 mb-10 px-2 relative z-10">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-1000 ease-out ${step >= 1 ? 'bg-sky-500 shadow-lg shadow-sky-200' : 'bg-zinc-100'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-1000 ease-out ${step >= 2 ? 'bg-sky-500 shadow-lg shadow-sky-200' : 'bg-zinc-100'}`} />
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-8">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-5 py-4 rounded-2xl text-xs font-black text-center animate-shake flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* STEP 1: Personal Info */}
            <div className={`space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 ${step !== 1 ? 'hidden' : ''}`}>
              <div className="text-right px-1">
                <h2 className="text-xl font-black text-zinc-900">إنشاء حساب التاجر</h2>
                <p className="text-[10px] font-black text-zinc-400 mt-1 uppercase tracking-widest opacity-60">الخطوة 1: المعلومات الشخصية</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-zinc-400 mr-2 uppercase tracking-widest">الاسم بالكامل</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-zinc-300 group-focus-within/input:text-sky-500 transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                    <input ref={fullNameRef} type="text" name="fullName" placeholder="محمد أحمد" className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all duration-300" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-zinc-400 mr-2 uppercase tracking-widest">البريد الإلكتروني</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-zinc-300 group-focus-within/input:text-sky-500 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input ref={emailRef} type="email" name="email" placeholder="admin@example.com" className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all duration-300" dir="ltr" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-zinc-400 mr-2 uppercase tracking-widest">كلمة المرور</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-zinc-300 group-focus-within/input:text-sky-500 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input ref={passwordRef} type="password" name="password" placeholder="••••••••" minLength={6} className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all duration-300" dir="ltr" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-zinc-900 text-white rounded-2xl py-5 font-black text-sm flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-100 active:scale-[0.98] group/btn">
                الخطوة التالية
                <ArrowRight className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>

            {/* STEP 2: Store Info */}
            <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ${step !== 2 ? 'hidden' : ''}`}>
              <div className="text-right px-1">
                <h2 className="text-xl font-black text-zinc-900">إعداد المتجر</h2>
                <p className="text-[10px] font-black text-zinc-400 mt-1 uppercase tracking-widest opacity-60">الخطوة 2: هوية علامتك التجارية</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-zinc-400 mr-2 uppercase tracking-widest">اسم المتجر</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-zinc-300 group-focus-within/input:text-sky-500 transition-colors">
                      <Store className="h-5 w-5" />
                    </div>
                    <input ref={storeNameRef} type="text" name="storeName" placeholder="مثال: بوتيك الأناقة" className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all duration-300" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-zinc-400 mr-2 uppercase tracking-widest">رابط المتجر (Slug)</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-zinc-400 font-black text-[9px] uppercase group-focus-within/input:text-sky-500 transition-colors">
                      URL
                    </div>
                    <input ref={slugRef} type="text" name="slug" value={slug} onChange={handleSlugChange} placeholder="my-awesome-store" className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 focus:bg-white transition-all duration-300" dir="ltr" />
                  </div>
                  <div className="flex items-center gap-2 mt-3 px-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                    <p className="text-[10px] text-zinc-400 font-bold" dir="ltr">
                      kayamarket.com/store/<span className="text-sky-500">{slug || 'your-link'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center h-16 w-16 bg-zinc-50 text-zinc-400 rounded-2xl hover:bg-zinc-100 active:scale-95 transition-all border border-zinc-100">
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-zinc-900 text-white rounded-2xl py-5 font-black text-sm flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-100 active:scale-[0.98] group/btn">
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

          <div className="mt-10 text-center pt-8 border-t border-zinc-50 relative">
            <p className="text-zinc-400 text-xs font-bold">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-sky-500 font-black hover:text-sky-600 transition-colors">تسجيل الدخول</Link>
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
