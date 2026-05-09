'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Languages, Sparkles, MessageCircle,
  FileText, Ticket, Navigation, Palette,
  Store, UserPlus, Rocket, TrendingUp, Plus, Minus,
  ShieldCheck, Cloud
} from 'lucide-react'

export const KayaLogo = ({ className = "h-9 w-9" }: { className?: string }) => (
  <div className="flex items-center" dir="ltr">
    <div className="text-sky-500 shrink-0">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`}>
        <path d="M15 50 C15 30.67 30.67 15 50 15 C69.33 15 85 30.67 85 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M85 50 C85 69.33 69.33 85 50 85 C30.67 85 15 69.33 15 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M30 35 L30 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M50 50 L50 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M35 30 L50 50 L65 30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M70 35 L70 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </div>
    <span className="text-xl md:text-2xl font-black text-sky-500 tracking-tight whitespace-nowrap leading-none">
      Kaya<span className="font-normal text-slate-400">Market</span>
    </span>
  </div>
)

const translations = {
  en: {
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      login: 'Log in',
      start: 'Start Your Store'
    },
    hero: {
      badge: 'KayaMarket 2.0 is live',
      title_part1: 'Launch Your Professional',
      title_part2: 'Online Store',
      desc: 'The complete platform to start, manage, and scale your business professionally with zero technical skills required.',
      cta1: 'Start Your Store Now'
    },
    features: {
      title: 'Everything you need to succeed',
      desc: 'Powerful tools designed to simplify your business management and scale your growth.',
      list: [
        { title: 'Elegant Store Builder', desc: 'Customizable themes with live preview and brand personalization.' },
        { title: 'Smart Invoice System', desc: 'Automatically generate professional invoices for every order with custom branding.' },
        { title: 'WhatsApp Integration', desc: 'Receive orders and communicate directly with customers via WhatsApp.' },
        { title: 'Live Order Tracking', desc: 'Real-time status updates for customers from "Pending" to "Delivered".' },
        { title: 'Marketing & Coupons', desc: 'Create discount codes and seasonal offers to boost your sales.' },
        { title: 'Visual Analytics', desc: 'Detailed insights into revenue, visitor traffic, and top-selling products.' },
        { title: 'Free SSL Certificate', desc: 'Secure hosting with automated Let\'s Encrypt SSL certificates for you and your custom domain.' },
        { title: 'Cloud Infrastructure', desc: 'Enterprise-grade hosting with auto-scaling and zero-downtime updates.' }
      ]
    },
    steps: {
      title: 'Start in 3 simple steps',
      desc: 'Join our ecosystem and launch your business today.',
      list: [
        { title: 'Create Account', desc: 'Sign up in seconds and name your store.' },
        { title: 'Add Products', desc: 'Upload your items with photos and prices.' },
        { title: 'Start Selling', desc: 'Launch your link and receive orders immediately.' }
      ]
    },
    faq: {
      title: 'Got Questions?',
      desc: 'Find answers to common questions about our platform.',
      list: [
        { q: 'Do I need coding skills?', a: 'Not at all, the platform is designed for total simplicity. You can manage everything through an intuitive dashboard.' },
        { q: 'How do I receive orders?', a: 'Orders arrive directly in your dashboard with instant notifications. You also get WhatsApp alerts if enabled.' },
        { q: 'Can I use a custom domain?', a: 'Yes, custom domain mapping is available in our professional plans to help you build a stronger brand.' },
        { q: 'What about payment methods?', a: 'We support Cash on Delivery, Mobile Wallets, and InstaPay.' },
        { q: 'Do you take commission on sales?', a: 'No, we do not take any commission or percentage of your sales. Your profits are entirely yours.' }
      ]
    },
    footer: {
      tagline: 'The modern platform for modern entrepreneurs.',
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
      badge: 'تم إطلاق KayaMarket 2.0',
      title_part1: 'أنشئ متجرك الإلكتروني',
      title_part2: 'الاحترافي في دقائق',
      desc: 'المنصة المتكاملة التي تمنحك كل ما تحتاجه لإطلاق مبيعاتك وتوسيع نطاق عملك بسهولة واحترافية، دون الحاجة لأي خبرة تقنية.',
      cta1: 'ابدأ متجرك الآن'
    },
    features: {
      title: 'كل ما تحتاجه للنجاح',
      desc: 'أدوات قوية مصممة لتبسيط إدارة أعمالك وقياس نموك وتوسعه.',
      list: [
        { title: 'منشئ متاجر احترافي', desc: 'ثيمات عصرية  مع تخصيص كامل للهوية البصرية والمعاينة المباشرة.' },
        { title: 'نظام فواتير ذكي', desc: 'إصدار فواتير احترافية تلقائياً لكل طلب مع شعار متجرك وبياناتك الخاصة.' },
        { title: 'الربط مع واتساب', desc: 'استقبل الطلبات وتواصل مباشرة مع عملائك عبر واتساب بنقرة واحدة.' },
        { title: 'تتبع مباشر للطلبات', desc: 'نظام تتبع يتيح لعملائك معرفة حالة طلبهم من "قيد التنفيذ" إلى "تم التوصيل".' },
        { title: 'التسويق والكوبونات', desc: 'أنشئ أكواد خصم وعروض موسمية لزيادة مبيعاتك وجذب عملاء جدد.' },
        { title: 'تحليلات بصرية', desc: 'رؤية واضحة لأداء متجرك، الأرباح، الزيارات، والمنتجات الأكثر مبيعاً.' },
        { title: 'أمان وتشفير SSL', desc: 'متجرك محمي بشهادة SSL مجانية وتلقائية تضمن أمان بيانات عملائك.' },
        { title: 'استضافة سحابية', desc: 'لا تقلق من التحديثات أو سقوط السيرفر، منصتك تعمل على بنية تحتية سحابية متطورة.' }
      ]
    },
    steps: {
      title: 'ابدأ في 3 خطوات بسيطة',
      desc: 'انضم إلى منظومتنا وأطلق مشروعك اليوم.',
      list: [
        { title: 'أنشئ حسابك', desc: 'سجل في ثوانٍ واختر اسماً لمتجرك.' },
        { title: 'أضف منتجاتك', desc: 'ارفع صور منتجاتك وحدد أسعارك بسهولة.' },
        { title: 'ابدأ البيع', desc: 'انشر رابط متجرك واستقبل طلباتك فوراً.' }
      ]
    },
    faq: {
      title: 'لديك استفسار؟',
      desc: 'إليك الأجوبة على أكثر الأسئلة شيوعاً حول المنصة.',
      list: [
        { q: 'هل أحتاج لخبرة في البرمجة؟', a: 'بالطبع لا، المنصة مصممة لتبسيط العملية تماماً. يمكنك إدارة كل شيء من لوحة تحكم بديهية.' },
        { q: 'كيف أستقبل الطلبات؟', a: 'تصل الطلبات مباشرة إلى لوحة التحكم مع تنبيهات فورية، كما يمكنك تفعيل تنبيهات واتساب.' },
        { q: 'هل يمكنني ربط دومين خاص؟', a: 'نعم، يمكنك ربط دومينك الخاص في الخطط الاحترافية لتعزيز هوية متجرك.' },
        { q: 'ماذا عن وسائل الدفع في المتجر؟', a: 'الدفع عند الاستلام وعلى المحافظ الإلكترونية وإنستا باي.' },
        { q: 'هل المنصة تأخذ نسبة على المبيعات؟', a: 'لا، لا نأخذ أي عمولة على مبيعاتك، أرباحك لك بالكامل.' }
      ]
    },
    footer: {
      tagline: 'المنصة العصرية لرواد الأعمال الطموحين.',
      rights: 'جميع الحقوق محفوظة.'
    }
  }
}

const SectionHeading = ({ title, desc }: { title: string, desc: string }) => (
  <div className="mb-16 space-y-4 flex flex-col items-center text-center">
    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{title}</h2>
    <div className="h-1.5 w-16 bg-sky-500 rounded-full" />
    <p className="text-slate-500 text-base md:text-lg font-semibold max-w-2xl opacity-70 leading-relaxed">{desc}</p>
  </div>
)

const FAQItem = ({ q, a }: { q: string, a: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border border-slate-100 rounded-[2rem] overflow-hidden transition-all bg-white shadow-sm hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-8 text-right hover:bg-slate-50/50 transition-colors"
      >
        <span className="text-xl font-black text-slate-900">{q}</span>
        <div className={`p-2 rounded-xl transition-all ${isOpen ? 'bg-sky-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
          {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </div>
      </button>
      {isOpen && (
        <div className="p-8 pt-0 text-slate-500 font-bold text-lg leading-relaxed animate-in fade-in slide-in-from-top-4 duration-300">
          {a}
        </div>
      )}
    </div>
  )
}

export function Footer({ lang, t }: { lang: 'en' | 'ar', t: any }) {
  return (
    <footer className="bg-white border-t border-slate-100 pt-24 pb-12 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Logo and Tagline Column */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col items-center md:items-start space-y-6">
            <KayaLogo className="h-10 w-10" />
            <p className="text-slate-400 leading-relaxed text-sm font-bold max-w-sm text-center md:text-start">
              {t.footer.tagline}
            </p>
          </div>

          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Links Columns */}
          <div className="md:col-span-6 lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-12 text-center md:text-start">
            {[
              { title: lang === 'en' ? 'Product' : 'المنتج', links: lang === 'en' ? ['Features', 'Pricing'] : ['المميزات', 'الأسعار'] },
              { title: lang === 'en' ? 'Resources' : 'المصادر', links: lang === 'en' ? ['Help Center', 'Guides'] : ['مركز المساعدة', 'الدلائل'] },
              { title: lang === 'en' ? 'Legal' : 'قانوني', links: lang === 'en' ? ['Privacy', 'Terms'] : ['الخصوصية', 'الشروط'] }
            ].map((section, i) => (
              <div key={i} className="space-y-6">
                <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, li) => (
                    <li key={li}>
                      <Link href={link === 'Pricing' || link === 'الأسعار' ? '/pricing' : '#'} className="text-slate-400 hover:text-sky-500 transition-colors font-bold text-sm block">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-slate-400 text-xs font-bold order-2 md:order-1">
            © {new Date().getFullYear()} KayaMarket. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4 order-1 md:order-2">
            {/* X / Twitter */}
            <a href="#" className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-white hover:shadow-md transition-all">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-white hover:shadow-md transition-all">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
            {/* Facebook */}
            <a href="#" className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-white hover:shadow-md transition-all">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function PlatformHomePage() {
  const [lang, setLang] = useState<'en' | 'ar'>('ar')
  const t = translations[lang]
  const isRtl = lang === 'ar'

  return (
    <div className={`min-h-screen bg-white text-slate-900 selection:bg-sky-100 ${isRtl ? 'font-cairo' : 'font-poppins'}`} dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-12">
          <KayaLogo />

          <div className="flex items-center gap-3 md:gap-8">
            <nav className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
              <a href="#features" className="hover:text-sky-500 transition-colors whitespace-nowrap">{t.nav.features}</a>
              <Link href="/pricing" className="hover:text-sky-500 transition-colors whitespace-nowrap">{t.nav.pricing}</Link>
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

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 min-h-[calc(100vh-81px)] text-center bg-white overflow-hidden py-10 md:py-16">
        {/* Abstract background elements for flair */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-50">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-50 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-blue-50 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-5xl space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
          <h1 className="text-4xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.15]">
            {t.hero.title_part1} <br className="hidden md:block" />
            <span className="text-sky-500">{t.hero.title_part2}</span>
          </h1>

          <p className="text-base md:text-lg text-slate-500 font-semibold max-w-2xl mx-auto leading-relaxed px-4 opacity-80">
            {t.hero.desc}
          </p>

          <div className="flex pt-1 justify-center">
            <Link href="/register" className="group flex items-center justify-center gap-4 rounded-2xl bg-zinc-900 px-10 md:px-14 py-4 md:py-5 text-lg md:text-xl font-black text-white hover:bg-zinc-800 transition-all hover:-translate-y-1 shadow-2xl shadow-zinc-200">
              {t.hero.cta1}
              <ArrowRight className={`h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </Link>
          </div>

          {/* Social proof stats - Responsive wrap */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-16 pt-6 border-t border-slate-100 mt-6">
            {[
              { value: '500+', label: isRtl ? 'تاجر نشط' : 'Active Merchants' },
              { value: '4.9★', label: isRtl ? 'تقييم المنصة' : 'Platform Rating' },
              { value: isRtl ? 'مجاناً' : 'Free', label: isRtl ? 'للبدء' : 'to Start' },
            ].map((stat, i) => (
              <div key={i} className="text-center min-w-[80px]">
                <div className="text-xl md:text-3xl font-black text-slate-900">{stat.value}</div>
                <div className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section - Very Light Azure */}
      <section className="py-32 bg-[#fcfdfe]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading title={t.steps.title} desc={t.steps.desc} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {t.steps.list.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-6 bg-white p-10 rounded-[3rem] border border-slate-50 shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-all">
                <div className="h-20 w-20 rounded-3xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-100">
                  {i === 0 && <UserPlus className="h-10 w-10" />}
                  {i === 1 && <Store className="h-10 w-10" />}
                  {i === 2 && <Rocket className="h-10 w-10" />}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900">{step.title}</h3>
                  <p className="text-slate-500 font-bold text-base leading-relaxed opacity-70">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Clean White Background */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading title={t.features.title} desc={t.features.desc} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.list.map((feat, i) => (
              <div key={i} className="bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 hover:border-sky-200 hover:bg-white hover:shadow-2xl hover:shadow-sky-100/50 transition-all duration-500 flex flex-col items-center text-center group">
                <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 text-sky-500 flex items-center justify-center mb-8 group-hover:bg-sky-500 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                  {i === 0 && <Palette className="h-8 w-8" />}
                  {i === 1 && <FileText className="h-8 w-8" />}
                  {i === 2 && <MessageCircle className="h-8 w-8" />}
                  {i === 3 && <Navigation className="h-8 w-8" />}
                  {i === 4 && <Ticket className="h-8 w-8" />}
                  {i === 5 && <TrendingUp className="h-8 w-8" />}
                  {i === 6 && <ShieldCheck className="h-8 w-8" />}
                  {i === 7 && <Cloud className="h-8 w-8" />}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{feat.title}</h3>
                <p className="text-slate-500 leading-relaxed font-bold text-sm opacity-70 max-w-[240px]">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Very Light Slate */}
      <section className="py-32 bg-[#fafbfc]">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeading title={t.faq.title} desc={t.faq.desc} />
          <div className="space-y-4">
            {t.faq.list.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Elegant Design */}
      <section className="px-6 py-20 md:py-32 bg-white">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] md:rounded-[3.5rem] p-10 md:p-24 text-center relative overflow-hidden border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] bg-white">
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
      </section>

      <Footer lang={lang} t={t} />
    </div>
  )
}
