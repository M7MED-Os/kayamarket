'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Languages, Sparkles, Plus, Minus, Rocket } from 'lucide-react'
import { KayaLogo, Footer } from '../page'

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
        desc: 'Perfect for testing the platform.',
        features: ['Up to 3 Products', '1 Photo per product', '1 Discount Coupon', 'WhatsApp Order Link', 'Standard Support', 'KayaMarket Subdomain'],
        cta: 'Get Started',
        popular: false
      },
      {
        name: 'Pro',
        price: '149',
        desc: 'Grow your business professionally.',
        features: ['Up to 10 Products', '5 Photos per product', '3 Discount Coupons', 'PDF Invoices', 'Brand Customization', 'Custom Domain Support', 'Advanced Analytics', 'Pro WhatsApp Integration', 'Advanced Support'],
        cta: 'Start Now',
        popular: true
      },
      {
        name: 'Pro Plus',
        price: '299',
        desc: 'The ultimate choice for large stores.',
        features: ['Unlimited Products', '10 Photos per product', 'Unlimited Discount Coupons', 'Everything in Pro', 'Remove Platform Logo', 'Pro WhatsApp Integration', '24/7 Priority Support'],
        cta: 'Go Unlimited',
        popular: false
      }
    ],
    faq: {
      title: 'Frequently Asked Questions',
      list: [
        { q: 'Can I change plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time from your dashboard settings.' },
        { q: 'Are there sub-subscriptions for other services?', a: 'No, the monthly subscription gives you access to all services and features available in your plan without any hidden fees or additional subscriptions.' },
        { q: 'How do I pay for the subscription?', a: 'After creating your account, go to Settings then Plans. Choose your preferred plan and follow the payment instructions. Select your payment method, enter the sender number, upload the receipt, and your store will be activated within hours.' }
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
        desc: 'مثالية لتجربة المنصة والبدء مجاناً.',
        features: ['حتى 3 منتجات', 'صورة واحدة لكل منتج', 'كوبون خصم واحد', 'ربط واتساب عادي', 'دعم فني', 'نطاق فرعي من KayaMarket'],
        cta: 'ابدأ مجاناً',
        popular: false
      },
      {
        name: 'برو',
        price: '149',
        desc: 'نمِّ عملك الصغير باحترافية كاملة.',
        features: ['حتى 10 منتجات', '5 صور لكل منتج', '3 كوبونات خصم', 'إصدار فواتير PDF', 'تخصيص الهوية البصرية', 'دومين مخصص', 'تحليلات متقدمة', 'ربط واتساب احترافي', 'دعم فني متقدم'],
        cta: 'اشترك الآن',
        popular: true
      },
      {
        name: 'برو بلس',
        price: '299',
        desc: 'الخيار الأقوى للتجار والمتاجر الكبيرة.',
        features: ['عدد لا نهائي من المنتجات', '10 صور لكل منتج', 'عدد لا نهائي من كوبونات الخصم', 'كل مميزات برو', 'إزالة شعار KayaMarket', 'ربط واتساب احترافي', 'دعم فني ذو أولوية 24/7'],
        cta: 'انطلق بلا حدود',
        popular: false
      }
    ],
    faq: {
      title: 'الأسئلة الشائعة',
      list: [
        { q: 'هل يمكنني تغيير خطتي لاحقاً؟', a: 'نعم، يمكنك ترقية أو تقليل خطتك في أي وقت من إعدادات لوحة التحكم.' },
        { q: 'هل يتم أخذ اشتراكات فرعية على باقي الخدمات؟', a: 'لا، الاشتراك الشهري يتيح لك الوصول لكافة الخدمات والمميزات المتاحة في خطتك دون أي رسوم خفية أو اشتراكات إضافية.' },
        { q: 'كيف أقوم بدفع الاشتراك؟', a: 'عند إنشاء حسابك، توجه إلى قسم الإعدادات ثم الخطط، اختر الخطة المناسبة لك وسيظهر لك خيار الدفع. قم باختيار وسيلة الدفع المفضلة، أدخل الرقم الذي حولت منه وارفع صورة الوصل، وسيتم تفعيل متجرك خلال دقائق فقط.' }
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
    <div className={`min-h-screen bg-white text-slate-900 selection:bg-sky-100 ${isRtl ? 'font-cairo' : 'font-poppins'}`} dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Header (Simplified Mirror of Home) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-12">
          <Link href="/" className="shrink-0">
            <KayaLogo />
          </Link>

          <div className="flex items-center gap-3 md:gap-8">
            <nav className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
              <Link href="/#features" className="hover:text-sky-500 transition-colors whitespace-nowrap">{t.nav.features}</Link>
              <Link href="/pricing" className="text-sky-500 transition-colors whitespace-nowrap">{t.nav.pricing}</Link>
            </nav>

            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-zinc-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
            >
              <Languages className="h-4 w-4 text-sky-500" />
              <span className="text-[10px] font-black">{lang === 'en' ? 'AR' : 'EN'}</span>
            </button>

            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden md:block text-xs font-black uppercase tracking-widest text-slate-900 hover:text-sky-500 transition-colors whitespace-nowrap">
                {t.nav.login}
              </Link>
              <Link href="/register" className="rounded-xl md:rounded-2xl bg-sky-500 px-5 md:px-7 py-3 md:py-3.5 text-[10px] md:text-xs font-black uppercase tracking-widest text-white hover:bg-sky-600 transition-all shadow-lg shadow-sky-100 whitespace-nowrap">
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
                  {billing === 'monthly' ? plan.price : Math.floor(Number(plan.price) * 0.8)}
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
                <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden transition-all shadow-sm bg-slate-50/30">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-right hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-black text-zinc-900 text-lg">{item.q}</span>
                    <div className={`p-1.5 rounded-lg ${activeFaq === i ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'} transition-all`}>
                      {activeFaq === i ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    </div>
                  </button>
                  {activeFaq === i && (
                    <div className="p-6 bg-white text-slate-500 font-bold leading-relaxed border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA - Elegant Design (Synced from Home) */}
        <div className="w-full max-w-5xl mx-auto my-32 px-6">
          <div className="rounded-[2.5rem] md:rounded-[3.5rem] p-10 md:p-24 text-center relative overflow-hidden border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] bg-white">
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-50 blur-[100px] -mr-40 -mt-40 rounded-full" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-50 blur-[100px] -ml-40 -mb-40 rounded-full" />

            <div className="relative z-10 space-y-8 md:space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-sky-600 shadow-sm">
                <Rocket className="h-3.5 w-3.5" />
                {isRtl ? 'ابدأ اليوم' : 'Get Started Today'}
              </div>
              <h2 className="text-3xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
                {isRtl ? 'جاهز لإطلاق مشروعك؟' : 'Ready to launch your store?'}
              </h2>
              <p className="text-slate-500 text-base md:text-xl font-semibold max-w-2xl mx-auto opacity-70 px-2">
                {isRtl ? 'انضم إلى آلاف التجار الناجحين وابدأ رحلتك اليوم مع KayaMarket.' : 'Join thousands of successful merchants and start your journey today with KayaMarket.'}
              </p>
              <div className="flex pt-4 md:pt-6 justify-center">
                <Link href="/register" className="group flex items-center gap-3 md:gap-4 bg-sky-500 text-white px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-lg md:text-xl hover:bg-sky-600 transition-all shadow-xl shadow-sky-200 hover:scale-[1.02] active:scale-[0.98]">
                  {t.nav.start}
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer lang={lang} t={t} />
    </div>
  )
}
