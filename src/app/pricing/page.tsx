'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Languages, Sparkles, ArrowRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { KayaLogo } from '../page'

const translations = {
  en: {
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      login: 'Log In',
      start: 'Start Your Store'
    },
    hero: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the perfect plan to grow your business. No hidden fees, no surprises.'
    },
    billing: {
      monthly: 'Monthly',
      yearly: 'Yearly',
      save: 'Save 20%'
    },
    plans: [
      {
        name: 'Free',
        price: '0',
        desc: 'Perfect for small sellers on social media.',
        features: ['Up to 3 Products', 'Standard Theme', 'WhatsApp Order Link', 'KayaMarket Subdomain'],
        cta: 'Get Started',
        popular: false
      },
      {
        name: 'Pro',
        price: '300',
        desc: 'Grow your small business professionally.',
        features: ['Up to 10 Products', 'Premium Theme Customization', 'Basic Sales Analytics', 'Standard Support', 'Custom Branding'],
        cta: 'Start Now',
        popular: true
      },
      {
        name: 'Pro Plus',
        price: '500',
        desc: 'Scale your brand without any limits.',
        features: ['Unlimited Products', 'Custom Domain Support', 'Advanced Analytics', 'Priority Support', 'Zero Commission Fees'],
        cta: 'Go Unlimited',
        popular: false
      }
    ],
    faq: {
      title: 'Frequently Asked Questions',
      list: [
        { q: 'Can I change plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time from your dashboard settings.' },
        { q: 'Do you charge transaction fees?', a: 'KayaMarket does not charge any transaction fees. You only pay your monthly subscription.' },
        { q: 'Can I use my own domain?', a: 'Yes, both Pro and Pro Plus plans support connecting your custom domain.' }
      ]
    },
    footer: {
      tagline: 'Grow your business online. The modern platform for modern entrepreneurs.',
      rights: 'All rights reserved.'
    }
  },
  ar: {
    nav: {
      features: 'المميزات',
      pricing: 'الأسعار',
      login: 'تسجيل الدخول',
      start: 'أنشئ متجرك الآن'
    },
    hero: {
      title: 'أسعار بسيطة وشفافة',
      subtitle: 'اختر الخطة المثالية لتنمية أعمالك. لا توجد رسوم خفية، ولا مفاجآت.'
    },
    billing: {
      monthly: 'شهرياً',
      yearly: 'سنوياً',
      save: 'وفر 20%'
    },
    plans: [
      {
        name: 'مجاني',
        price: '0',
        desc: 'مثالية للبائعين الصغار على السوشيال ميديا.',
        features: ['حتى 5 منتجات', 'قالب قياسي', 'رابط طلب واتساب', 'نطاق فرعي من KayaMarket'],
        cta: 'ابدأ مجاناً',
        popular: false
      },
      {
        name: 'برو',
        price: '300',
        desc: 'نمِّ عملك الصغير باحترافية.',
        features: ['حتى 100 منتج', 'تخصيص القالب المميز', 'تحليلات مبيعات أساسية', 'دعم فني قياسي', 'هوية تجارية مخصصة'],
        cta: 'اشترك الآن',
        popular: true
      },
      {
        name: 'برو بلس',
        price: '500',
        desc: 'وسع نطاق علامتك التجارية بدون حدود.',
        features: ['منتجات غير محدودة', 'دعم النطاق الخاص (Domain)', 'تحليلات وتقارير متقدمة', 'دعم ذو أولوية', 'بدون عمولة على المبيعات'],
        cta: 'انطلق بلا حدود',
        popular: false
      }
    ],
    faq: {
      title: 'الأسئلة الشائعة',
      list: [
        { q: 'هل يمكنني تغيير خطتي لاحقاً؟', a: 'نعم، يمكنك ترقية أو تقليل خطتك في أي وقت من إعدادات لوحة التحكم.' },
        { q: 'هل تتقاضون رسوماً على المعاملات؟', a: 'منصة KayaMarket لا تتقاضى أي رسوم على المعاملات. أنت تدفع فقط اشتراكك الشهري.' },
        { q: 'هل يمكنني استخدام الدومين الخاص بي؟', a: 'نعم، تدعم خطتا "النمو" و "الاحترافية" ربط النطاق الخاص بك.' }
      ]
    },
    footer: {
      tagline: 'نمِّ تجارتك عبر الإنترنت. المنصة العصرية لرواد الأعمال الطموحين.',
      rights: 'جميع الحقوق محفوظة.'
    }
  }
}

export default function PricingPage() {
  const [lang, setLang] = useState<'en' | 'ar'>('ar')
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  
  const t = translations[lang]
  const isRtl = lang === 'ar'

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-100 ${isRtl ? 'font-cairo' : 'font-poppins'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header (Simplified Mirror of Home) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <div className="text-sky-500 shrink-0">
              <KayaLogo className="h-10 w-10" />
            </div>
            <span className="text-xl md:text-2xl font-black text-sky-500 tracking-tight whitespace-nowrap">
              Kaya<span className="font-semibold text-slate-400">Market</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-8">
            <nav className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
              <Link href="/#features" className="hover:text-sky-500 transition-colors whitespace-nowrap">{t.nav.features}</Link>
              <Link href="/pricing" className="text-sky-500 transition-colors whitespace-nowrap">{t.nav.pricing}</Link>
            </nav>
            
            <button 
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-zinc-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all shrink-0"
            >
              <Languages className="h-4 w-4 text-sky-500" />
              <span className="text-[10px] font-black">{lang === 'en' ? 'العربية' : 'ENGLISH'}</span>
            </button>

            <div className="flex items-center gap-3 md:pl-8 md:border-l border-slate-200 md:rtl:pl-0 md:rtl:pr-8 md:rtl:border-l-0 md:rtl:border-r">
              <Link href="/login" className="hidden md:block text-xs font-black uppercase tracking-widest text-slate-900 hover:text-sky-500 transition-colors whitespace-nowrap">
                {t.nav.login}
              </Link>
              <Link href="/register" className="rounded-xl md:rounded-2xl bg-sky-500 px-3.5 md:px-6 py-2.5 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-white hover:bg-sky-600 transition-all shadow-lg shadow-sky-200 whitespace-nowrap">
                {t.nav.start}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center">
        {/* Hero Section */}
        <div className="w-full max-w-4xl pt-24 pb-16 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-black mb-8 text-zinc-900 leading-tight">
            {t.hero.title}
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-bold opacity-80 max-w-2xl mx-auto mb-12">
            {t.hero.subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-black ${billing === 'monthly' ? 'text-zinc-900' : 'text-slate-400'}`}>{t.billing.monthly}</span>
            <button 
              onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
              className="w-14 h-8 bg-zinc-200 rounded-full relative p-1 transition-colors hover:bg-zinc-300"
            >
              <div className={`absolute top-1 w-6 h-6 bg-sky-500 rounded-full transition-all duration-300 ${billing === 'monthly' ? (isRtl ? 'right-1' : 'left-1') : (isRtl ? 'right-7' : 'left-7')}`} />
            </button>
            <span className={`text-sm font-black ${billing === 'yearly' ? 'text-zinc-900' : 'text-slate-400'}`}>{t.billing.yearly}</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-wider">{t.billing.save}</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 px-6 pb-32">
          {t.plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative bg-white rounded-[2.5rem] p-10 border transition-all duration-500 flex flex-col ${plan.popular ? 'border-sky-500 shadow-2xl shadow-sky-100 scale-105 z-10' : 'border-slate-100 shadow-sm hover:shadow-xl'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-sky-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {lang === 'en' ? 'Most Popular' : 'الأكثر شعبية'}
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-black text-zinc-900 mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm font-bold leading-relaxed">{plan.desc}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-black text-zinc-900">
                  {billing === 'monthly' ? plan.price : Math.floor(Number(plan.price) * 0.8 * 12 / 12)}
                </span>
                <span className="text-slate-400 font-bold text-sm">
                  {lang === 'en' ? 'EGP/mo' : 'ج.م/شهرياً'}
                </span>
              </div>

              <div className="space-y-4 mb-12 flex-1">
                {plan.features.map((feat, fi) => (
                  <div key={fi} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-bold text-slate-600">{feat}</span>
                  </div>
                ))}
              </div>

              <Link 
                href="/register" 
                className={`w-full py-4 rounded-2xl text-center font-black transition-all ${plan.popular ? 'bg-sky-500 text-white shadow-lg shadow-sky-200 hover:bg-sky-600' : 'bg-slate-100 text-zinc-900 hover:bg-slate-200'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="w-full bg-white border-y border-slate-100 py-32 flex justify-center">
          <div className="w-full max-w-4xl px-6">
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-16 text-center">{t.faq.title}</h2>
            <div className="space-y-4">
              {t.faq.list.map((item, i) => (
                <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden transition-all">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-right bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-black text-zinc-900 text-lg">{item.q}</span>
                    {activeFaq === i ? <ChevronUp className="h-5 w-5 text-sky-500" /> : <ChevronDown className="h-5 w-5 text-sky-500" />}
                  </button>
                  {activeFaq === i && (
                    <div className="p-6 bg-white text-slate-500 font-bold leading-relaxed border-t border-slate-50">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="w-full max-w-5xl mx-auto my-32 bg-zinc-900 rounded-[2.5rem] md:rounded-[3rem] p-8 md:py-20 md:px-12 text-center relative overflow-hidden shadow-2xl shadow-zinc-200">
           <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/20 blur-[100px] rounded-full -mr-40 -mt-40" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 blur-[80px] rounded-full -ml-32 -mb-32" />
           
           <div className="relative z-10 max-w-2xl mx-auto space-y-8">
             <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
               {isRtl ? 'جاهز لإطلاق متجرك؟' : 'Ready to launch your store?'}
             </h2>
             <p className="text-zinc-400 text-sm md:text-base font-bold">
               {isRtl ? 'ابدأ رحلتك اليوم وأنشئ متجر أحلامك الإلكتروني مع أدوات KayaMarket القوية والبسيطة.' : 'Start your journey today and build the online store of your dreams with KayaMarket\'s powerful and simple tools.'}
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/register" className="group flex items-center gap-3 bg-white text-zinc-900 px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-base hover:bg-sky-50 transition-all shadow-xl">
                  {t.nav.start}
                  <Sparkles className="h-5 w-5 text-sky-500 group-hover:scale-125 transition-transform" />
                </Link>
             </div>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className={`md:col-span-1 ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-1 mb-8 text-sky-500`}>
                <KayaLogo className="h-10 w-10" />
                <span className="text-2xl font-black text-sky-500 tracking-tight">Kaya<span className="text-slate-500">Market</span></span>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm font-bold mb-6">
                {t.footer.tagline}
              </p>
              <button 
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="flex lg:hidden items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-100 transition-all text-xs font-black"
              >
                <Languages className="h-4 w-4 text-sky-500" />
                {lang === 'en' ? 'العربية' : 'English'}
              </button>
            </div>
            
            {[
              { title: lang === 'en' ? 'Product' : 'المنتج', links: lang === 'en' ? ['Features', 'Pricing'] : ['المميزات', 'الأسعار'] },
              { title: lang === 'en' ? 'Resources' : 'المصادر', links: lang === 'en' ? ['Help Center', 'Guides'] : ['مركز المساعدة', 'الدلائل'] },
              { title: lang === 'en' ? 'Legal' : 'قانوني', links: lang === 'en' ? ['Privacy', 'Terms'] : ['الخصوصية', 'الشروط'] }
            ].map((section, i) => (
              <div key={i} className={isRtl ? 'text-right' : 'text-left'}>
                <h4 className={`text-zinc-900 font-black mb-8 uppercase tracking-widest text-xs`}>{section.title}</h4>
                <div className="flex flex-col gap-4">
                  {section.links.map((link, li) => (
                    <a key={li} href="#" className="text-slate-400 hover:text-sky-500 transition-colors font-bold text-sm">{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-400 text-xs font-bold">
              © {new Date().getFullYear()} KayaMarket. {t.footer.rights}
            </p>
            <div className="flex gap-6">
               <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100"></div>
               <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100"></div>
               <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
