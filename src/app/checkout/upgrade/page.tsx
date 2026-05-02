'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
   ArrowRight, 
   ShieldCheck, 
   Copy, 
   Smartphone, 
   UploadCloud, 
   CheckCircle2, 
   Loader2, 
   Zap,
   Lock,
   Building2,
   Check,
   AlertCircle,
   SmartphoneIcon,
   Shield,
   ImageIcon,
   Monitor,
   Globe,
   FileText,
   Layers,
   BarChart3,
   MessageCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PlanTier, getPlanName } from '@/lib/subscription'
import ImageUpload from '@/components/ImageUpload'
import { submitUpgradeRequest } from '@/app/actions/subscription'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function UpgradeCheckoutPage() {
   const searchParams = useSearchParams()
   const router = useRouter()
   const planId = (searchParams?.get('plan') || 'growth') as PlanTier
   
   const [loading, setLoading] = useState(true)
   const [submitting, setSubmitting] = useState(false)
   const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'instapay' | 'bank'>('wallet')
   const [senderDetail, setSenderDetail] = useState('')
   const [receiptUrl, setReceiptUrl] = useState('')
   
   const [storeName, setStoreName] = useState('')
   const [ownerName, setOwnerName] = useState('')
   const [userEmail, setUserEmail] = useState('')
   const [planData, setPlanData] = useState<any>(null)

   useEffect(() => {
      const fetchData = async () => {
         try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            setUserEmail(user.email || '')
            setOwnerName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'التاجر')

            const { data: roleData } = await supabase
               .from('user_roles')
               .select('store_id')
               .eq('user_id', user.id)
               .maybeSingle()

            if (roleData?.store_id) {
               const { data: store } = await supabase
                  .from('stores')
                  .select('name')
                  .eq('id', roleData.store_id)
                  .single()
               
               if (store) setStoreName(store.name)
            }

            const { data: plan } = await supabase
               .from('subscription_plans')
               .select('*')
               .eq('id', planId)
               .single()
            
            setPlanData(plan)
         } catch (err) { console.error(err) } finally { setLoading(false) }
      }
      fetchData()
   }, [router, planId])

   const validateSenderDetail = () => {
      if (!senderDetail) return false
      if (paymentMethod === 'wallet') return /^01[0125][0-9]{8}$/.test(senderDetail)
      if (paymentMethod === 'instapay') return senderDetail.includes('@instapay') || /^01[0125][0-9]{8}$/.test(senderDetail)
      return false
   }

   const isValid = validateSenderDetail() && receiptUrl !== ''

   if (loading) return (
      <div className="min-h-screen bg-white flex items-center justify-center">
         <div className="h-10 w-10 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
   )

   // Map plan data to displayable features
   const features = planData ? [
      { label: `حتى ${planData.max_products} منتج`, enabled: true, icon: Layers },
      { label: `${planData.max_images_per_product} صور لكل منتج`, enabled: true, icon: ImageIcon },
      { label: `${planData.max_coupons || 0} كوبونات خصم`, enabled: (planData.max_coupons || 0) > 0, icon: Zap },
      { label: 'فواتير PDF احترافية', enabled: planData.has_pdf_invoice, icon: FileText },
      { label: 'تقارير وتحليلات متقدمة', enabled: planData.has_advanced_analytics, icon: BarChart3 },
      { label: 'إزالة علامة كايا المائية', enabled: planData.can_remove_watermark, icon: ShieldCheck },
      { label: 'ربط دومين مخصص (.com)', enabled: planData.has_custom_domain, icon: Globe },
      { label: 'ربط واتساب بزنس', enabled: planData.has_professional_whatsapp, icon: MessageCircle },
   ].filter(f => f.enabled) : []

   return (
      <div className="min-h-screen bg-slate-50 text-right font-cairo selection:bg-sky-100" dir="rtl">
         
         <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-20">
            <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
               <div className="flex items-center gap-1 shrink-0">
                  <div className="text-sky-500 shrink-0">
                     <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 shrink-0">
                        <path d="M15 50 C15 30.67 30.67 15 50 15 C69.33 15 85 30.67 85 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round"></path>
                        <path d="M85 50 C85 69.33 69.33 85 50 85 C30.67 85 15 69.33 15 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round"></path>
                        <path d="M30 35 L30 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round"></path>
                        <path d="M50 50 L50 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round"></path>
                        <path d="M35 30 L50 50 L65 30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M70 35 L70 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round"></path>
                     </svg>
                  </div>
                  <span className="text-lg md:text-xl font-black text-sky-500 tracking-tight whitespace-nowrap">
                     Kaya<span className="font-semibold text-slate-400">Market</span>
                  </span>
               </div>
               
               <Link href="/admin/settings" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2">
                  إلغاء والعودة
                  <ArrowRight className="h-3 w-3" />
               </Link>
            </div>
         </header>

         <main className="max-w-5xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               
               <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                     <div className="flex items-center gap-2 mb-6">
                        <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                        <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest">تأكيد الترقية</span>
                     </div>
                     
                     <h2 className="text-xl font-black text-slate-900 mb-1">باقة {planData?.name || getPlanName(planId)}</h2>
                     <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">{Math.floor(planData?.price_monthly || 0)}</span>
                        <span className="text-[10px] font-bold text-slate-400">ج.م / شهر</span>
                     </div>

                     <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                        <div className="space-y-3">
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">بيانات الحساب</p>
                           <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400 font-bold">المتجر:</span>
                              <span className="text-slate-900 font-black">{storeName || '...'}</span>
                           </div>
                           <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400 font-bold">المالك:</span>
                              <span className="text-slate-900 font-black">{ownerName || '...'}</span>
                           </div>
                           <div className="flex justify-between items-center text-[11px] gap-4">
                              <span className="text-slate-400 font-bold shrink-0">البريد:</span>
                              <span className="text-slate-900 font-black truncate max-w-full text-left" dir="ltr">{userEmail || '...'}</span>
                           </div>
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t border-slate-50">
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">مميزات الباقة</p>
                           <div className="grid grid-cols-1 gap-2.5">
                              {features.map((f, i) => (
                                 <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                                    <div className="h-5 w-5 rounded-md bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                                       <f.icon className="h-3 w-3" />
                                    </div>
                                    {f.label}
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-zinc-900 rounded-3xl p-8 text-white shadow-xl shadow-zinc-100">
                     <h4 className="text-xs font-black mb-6 flex items-center gap-3 text-sky-400">
                        <ShieldCheck className="h-4 w-4" />
                        تعليمات الدفع
                     </h4>
                     <ul className="space-y-4 text-[11px] font-bold text-zinc-400">
                        <li className="flex gap-3">
                           <span className="h-5 w-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[10px]">1</span>
                           <p>اختر الوسيلة وحول المبلغ المطلوب.</p>
                        </li>
                        <li className="flex gap-3">
                           <span className="h-5 w-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[10px]">2</span>
                           <p>انسخ الرقم أو العنوان الموضح بالأسفل.</p>
                        </li>
                        <li className="flex gap-3">
                           <span className="h-5 w-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[10px]">3</span>
                           <p>ارفع الإيصال وأدخل بياناتك للتأكيد.</p>
                        </li>
                     </ul>
                  </div>
               </div>

               <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden h-fit">
                  <div className="p-8 md:p-10 space-y-8">
                     
                     <div className="space-y-5">
                        <div className="flex items-center justify-between">
                           <h3 className="text-base font-black text-slate-900">وسيلة الدفع</h3>
                           <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">اختر وسيلة واحدة</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {[
                              { id: 'wallet', label: 'محفظة إلكترونية', sub: 'كاش / فودافون', icon: SmartphoneIcon, disabled: false },
                              { id: 'instapay', label: 'InstaPay', sub: 'تحويل لحظي', icon: Zap, disabled: false },
                              { id: 'bank', label: 'حساب بنكي', sub: 'إيداع مباشر', icon: Building2, disabled: true }
                           ].map((m) => (
                              <label 
                                 key={m.id}
                                 className={`relative flex flex-col p-4 rounded-2xl border-2 transition-all cursor-pointer group ${paymentMethod === m.id ? 'border-sky-500 bg-sky-50/10 shadow-lg shadow-sky-500/5' : 'border-slate-100 bg-white hover:border-slate-200'} ${m.disabled ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                              >
                                 <input 
                                    type="radio" 
                                    name="payment" 
                                    disabled={m.disabled}
                                    checked={paymentMethod === m.id}
                                    onChange={() => { setPaymentMethod(m.id as any); setSenderDetail('') }}
                                    className="sr-only"
                                 />
                                 <div className="flex items-center justify-between mb-3">
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${paymentMethod === m.id ? 'bg-sky-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
                                       <m.icon className="h-4 w-4" />
                                    </div>
                                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === m.id ? 'border-sky-500 bg-sky-500' : 'border-slate-200'}`}>
                                       {paymentMethod === m.id && <Check className="h-2 w-2 text-white" strokeWidth={4} />}
                                    </div>
                                 </div>
                                 <div className="space-y-0.5">
                                    <p className={`text-xs font-black transition-colors ${paymentMethod === m.id ? 'text-sky-600' : 'text-slate-900'}`}>{m.label}</p>
                                    <p className="text-[9px] font-bold text-slate-400">{m.sub}</p>
                                 </div>
                              </label>
                           ))}
                        </div>
                     </div>

                     <div className="bg-zinc-900 rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-zinc-200">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-3xl rounded-full -mr-32 -mt-32" />
                        <div className="relative space-y-8">
                           
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                              <div className="space-y-1.5">
                                 <p className="text-[9px] font-black text-sky-400 uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity">رقم الموبايل الموحد</p>
                                 <h4 className="text-2xl md:text-3xl font-black tracking-tight selection:bg-sky-500 leading-none">01117691093</h4>
                              </div>
                              <button 
                                 onClick={() => { 
                                    navigator.clipboard.writeText('01117691093'); 
                                    toast.success('تم نسخ الرقم بنجاح');
                                 }}
                                 className="h-12 px-8 bg-white text-zinc-900 hover:bg-sky-50 rounded-xl font-black text-[11px] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 shrink-0"
                              >
                                 <Copy className="h-3.5 w-3.5" />
                                 نسخ الرقم
                              </button>
                           </div>

                           {paymentMethod === 'instapay' && (
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 border-t border-white/5 group animate-in slide-in-from-top-4 duration-300">
                                 <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-sky-400 uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity">عنوان InstaPay</p>
                                    <p className="text-lg md:text-xl font-black text-white selection:bg-sky-500 leading-none break-all">mohamedosama295@instapay</p>
                                 </div>
                                 <button 
                                    onClick={() => { 
                                       navigator.clipboard.writeText('mohamedosama295@instapay'); 
                                       toast.success('تم نسخ عنوان InstaPay');
                                    }}
                                    className="h-12 px-8 bg-white text-zinc-900 hover:bg-sky-50 rounded-xl font-black text-[11px] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 shrink-0"
                                 >
                                    <Copy className="h-3.5 w-3.5" />
                                    نسخ العنوان
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-400 mr-1 uppercase tracking-widest">بيانات التحويل (رقمك / عنوانك)</label>
                           <div className="relative">
                              <input
                                 value={senderDetail}
                                 onChange={e => setSenderDetail(e.target.value)}
                                 className={`w-full h-12 bg-slate-50 border-2 border-slate-50 rounded-xl px-5 text-xs font-black outline-none focus:border-sky-500 focus:bg-white transition-all ${senderDetail && !validateSenderDetail() ? 'border-rose-100' : ''}`}
                                 placeholder="ادخل الرقم او عنوان الانستا باي.."
                              />
                              {senderDetail && validateSenderDetail() && <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-in zoom-in" />}
                           </div>
                           {senderDetail && !validateSenderDetail() && (
                              <p className="text-[9px] font-bold text-rose-500 mr-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                 <AlertCircle className="h-3 w-3" />
                                 {paymentMethod === 'wallet' ? 'يرجى إدخال رقم موبايل صحيح (11 رقم)' : 'يرجى إدخال رقم موبايل أو عنوان InstaPay صحيح (@instapay)'}
                              </p>
                           )}
                        </div>

                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-400 mr-1 uppercase tracking-widest">صورة إيصال التحويل</label>
                           <div className={`relative h-12 border-2 border-dashed rounded-xl flex items-center px-5 transition-all overflow-hidden ${receiptUrl ? 'bg-emerald-50 border-emerald-500/20' : 'bg-slate-50 border-slate-200 hover:border-sky-400 hover:bg-white group'}`}>
                              <div className="flex items-center gap-4 w-full">
                                 <div className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${receiptUrl ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                                    {receiptUrl ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <UploadCloud className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />}
                                 </div>
                                 <span className={`text-[10px] font-black ${receiptUrl ? 'text-emerald-700' : 'text-slate-500'}`}>
                                    {receiptUrl ? 'تم الرفع بنجاح' : 'ارفع صورة الإيصال'}
                                 </span>
                              </div>
                              <div className="absolute inset-0 opacity-0 cursor-pointer">
                                 <ImageUpload category="banners" currentUrl={receiptUrl} onUploadSuccess={setReceiptUrl} />
                              </div>
                           </div>
                           {!receiptUrl && submitting && (
                              <p className="text-[9px] font-bold text-rose-500 mr-1 flex items-center gap-1">
                                 <AlertCircle className="h-3 w-3" />
                                 يرجى رفع صورة الإيصال لإتمام العملية
                              </p>
                           )}
                        </div>
                     </div>

                     <button
                        onClick={async () => {
                           if (!isValid) return
                           setSubmitting(true)
                           const formData = new FormData()
                           formData.append('plan_id', planId)
                           formData.append('sender_phone', `${paymentMethod.toUpperCase()}: ${senderDetail}`)
                           formData.append('receipt_url', receiptUrl)
                           const res = await submitUpgradeRequest(formData)
                           if (res.success) { toast.success('تم إرسال طلب الترقية بنجاح'); router.push('/admin/settings') }
                           else { toast.error(res.error || 'حدث خطأ') }
                           setSubmitting(false)
                        }}
                        disabled={submitting || !isValid}
                        className={`w-full h-14 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg ${isValid ? 'bg-sky-500 text-white shadow-sky-100 hover:bg-sky-600 hover:translate-y-[-2px]' : 'bg-slate-100 text-slate-300'}`}
                     >
                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'تأكيد الحوالة وإرسال الطلب'}
                     </button>
                  </div>
               </div>
            </div>
         </main>
         
         <footer className="py-10 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-3">
               <Shield className="h-3 w-3" />
               Kaya Platform Security © 2024
            </p>
         </footer>
      </div>
   )
}
