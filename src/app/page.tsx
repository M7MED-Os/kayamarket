'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BarChart2, LayoutTemplate, ShieldCheck, Zap, Globe, ShoppingBag, CheckCircle2, Languages, Sparkles } from 'lucide-react'

export const KayaLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`}>
    <path d="M15 50 C15 30.67 30.67 15 50 15 C69.33 15 85 30.67 85 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M85 50 C85 69.33 69.33 85 50 85 C30.67 85 15 69.33 15 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M30 35 L30 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M50 50 L50 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M35 30 L50 50 L65 30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M70 35 L70 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
  </svg>
)

const translations = {
  en: {
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      resources: 'Resources',
      login: 'Log in',
      start: 'Start Your Store'
    },
    hero: {
      badge: 'KayaMarket 2.0 is live',
      title: 'Grow Your Business Online',
      desc: 'The easiest way to create and manage your online store. Setup in minutes, customize your brand, and start selling today with zero technical skills required.',
      cta1: 'Start Your Store',
      cta2: 'View Dashboard'
    },
    features: {
      title: 'Everything you need to succeed',
      desc: 'Powerful tools designed to simplify your business management and scale your growth.',
      list: [
        { title: 'Simple Store Builder', desc: 'Drag and drop interface to customize your theme, colors, fonts, and logo with live preview.' },
        { title: 'Product Management', desc: 'Easily add, edit, and organize your products. Track stock levels and variations effortlessly.' },
        { title: 'Visual Analytics', desc: 'Understand your growth with clear, simple charts showing revenue, orders, and visitors.' },
        { title: 'Fast Checkout Flow', desc: 'Smooth customer experience from product discovery to final payment.' },
        { title: 'Secure & Scalable', desc: 'Enterprise-grade security and isolated databases for every store.' },
        { title: 'Mobile First', desc: 'Your store looks and works perfectly on any device, right out of the box.' }
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
      resources: 'المصادر',
      login: 'تسجيل الدخول',
      start: 'أنشئ متجرك الآن'
    },
    hero: {
      badge: 'تم إطلاق KayaMarket 2.0',
      title: 'نمِّ تجارتك عبر الإنترنت',
      desc: 'الطريقة الأسهل لإنشاء وإدارة متجرك الإلكتروني. إعداد في دقائق، تخصيص هويتك التجارية، وابدأ البيع اليوم دون الحاجة لخبرة تقنية.',
      cta1: 'أنشئ متجرك الآن',
      cta2: 'لوحة التحكم'
    },
    features: {
      title: 'كل ما تحتاجه للنجاح',
      desc: 'أدوات قوية مصممة لتبسيط إدارة أعمالك وقياس نموك وتوسعه.',
      list: [
        { title: 'منشئ متاجر بسيط', desc: 'واجهة سحب وإفلات لتخصيص القالب، الألوان، الخطوط، والشعار مع معاينة مباشرة.' },
        { title: 'إدارة المنتجات', desc: 'أضف، عدل، ونظم منتجاتك بسهولة. تتبع مستويات المخزون والأنواع المختلفة بجهد أقل.' },
        { title: 'تحليلات بصرية', desc: 'افهم نموك من خلال رسوم بيانية واضحة وبسيطة تعرض الإيرادات، الطلبات، والزوار.' },
        { title: 'تدفق شراء سريع', desc: 'تجربة عملاء سلسة تبدأ من اكتشاف المنتج وحتى إتمام عملية الدفع النهائية.' },
        { title: 'آمن وقابل للتوسع', desc: 'أمان بمستوى الشركات وقواعد بيانات مستقلة ومعزولة لكل متجر.' },
        { title: 'الأولوية للهاتف', desc: 'متجرك يبدو ويعمل بشكل مثالي على أي جهاز، بمجرد إطلاقه مباشرة.' }
      ]
    },
    footer: {
      tagline: 'نمِّ تجارتك عبر الإنترنت. المنصة العصرية لرواد الأعمال الطموحين.',
      rights: 'جميع الحقوق محفوظة.'
    }
  }
}

export default function PlatformHomePage() {
  const [lang, setLang] = useState<'en' | 'ar'>('ar')
  const t = translations[lang]
  const isRtl = lang === 'ar'

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-100 ${isRtl ? 'font-cairo' : 'font-poppins'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-1 shrink-0">
            <div className="text-sky-500 shrink-0">
              <KayaLogo className="h-10 w-10" />
            </div>
            <span className="text-xl md:text-2xl font-black text-sky-500 tracking-tight whitespace-nowrap">
              Kaya<span className="font-semibold text-slate-400">Market</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-8">
            <nav className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
              <a href="#features" className="hover:text-sky-500 transition-colors whitespace-nowrap">{t.nav.features}</a>
              <Link href="/pricing" className="hover:text-sky-500 transition-colors whitespace-nowrap">{t.nav.pricing}</Link>
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

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-6 pt-24 pb-20 text-center">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-[10px] font-black uppercase tracking-widest text-sky-600 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            {t.hero.badge}
          </div>

          <h1 className={`text-4xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.15]`}>
            {lang === 'en' ? (
              <>Grow Your Business <br className="hidden md:block" /> <span className="text-sky-500">Online</span></>
            ) : (
              <>نمِّ تجارتك <span className="text-sky-500">عبر الإنترنت</span> <br className="hidden md:block" /> بسهولة تامة</>
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed px-4">
            {t.hero.desc}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/register" className="group flex items-center justify-center gap-3 w-full sm:w-auto rounded-2xl bg-zinc-900 px-10 py-5 text-lg font-black text-white hover:bg-zinc-800 transition-all hover:-translate-y-1 shadow-2xl shadow-zinc-200">
              {t.hero.cta1}
              <ArrowRight className={`h-5 w-5 group-hover:translate-x-1 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
            <Link href="/admin" className="flex items-center justify-center w-full sm:w-auto rounded-2xl bg-white border border-slate-200 px-10 py-5 text-lg font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
              {t.hero.cta2}
            </Link>
          </div>
        </div>

        {/* Dashboard Preview - Hidden on mobile */}
        <div className="hidden md:block w-full max-w-5xl mt-24 relative rounded-[3rem] overflow-hidden border border-slate-200 bg-white shadow-2xl p-4 md:p-6 group">
           <div className="aspect-[1.2/1] md:aspect-[16/9] w-full rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden relative shadow-inner">
              {/* Mock Dashboard UI - Represents the actual Admin UI but with platform colors */}
              <div className="absolute inset-0 bg-[#fffbfc] flex flex-col scale-[0.8] sm:scale-100 transition-all duration-700 origin-center min-w-[500px] left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 sm:min-w-0 sm:w-full">
                {/* Header */}
                <div className="h-16 border-b border-zinc-100 bg-white flex items-center justify-between px-8">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-200">
                      <KayaLogo className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="h-2 w-24 bg-zinc-100 rounded-full"></div>
                      <div className="h-1.5 w-16 bg-zinc-50 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-50 border border-zinc-100"></div>
                    <div className="h-8 w-24 rounded-full bg-sky-50 border border-sky-100"></div>
                  </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* Sidebar - Hidden on extreme small/scaled views for better clarity */}
                  <div className="w-60 border-r border-zinc-100 p-6 hidden lg:block bg-white">
                    <div className="space-y-3">
                      <div className="h-10 bg-sky-50 rounded-xl w-full flex items-center px-4 gap-3">
                         <div className="h-4 w-4 rounded-md bg-sky-200"></div>
                         <div className="h-2 w-20 bg-sky-300 rounded-full"></div>
                      </div>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 bg-white rounded-xl w-full border border-zinc-50 flex items-center px-4 gap-3">
                           <div className="h-4 w-4 rounded-md bg-zinc-100"></div>
                           <div className="h-2 w-16 bg-zinc-100 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-auto pt-40">
                      <div className="h-20 bg-zinc-50 rounded-2xl w-full border border-zinc-100 border-dashed"></div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-8 space-y-8 overflow-hidden bg-zinc-50/30">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="h-6 w-48 bg-zinc-800 rounded-lg"></div>
                        <div className="h-3 w-32 bg-zinc-400 rounded-full opacity-50"></div>
                      </div>
                      <div className="h-10 w-32 bg-sky-500 rounded-xl shadow-lg shadow-sky-200 flex items-center justify-center">
                         <div className="h-2 w-16 bg-white/40 rounded-full"></div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-3">
                        <div className="h-8 w-8 bg-sky-100 rounded-lg"></div>
                        <div className="h-3 w-20 bg-zinc-100 rounded-full"></div>
                        <div className="h-6 w-12 bg-zinc-900 rounded-lg"></div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg"></div>
                        <div className="h-3 w-20 bg-zinc-100 rounded-full"></div>
                        <div className="h-6 w-12 bg-zinc-900 rounded-lg"></div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-3 hidden sm:block">
                        <div className="h-8 w-8 bg-amber-100 rounded-lg"></div>
                        <div className="h-3 w-20 bg-zinc-100 rounded-full"></div>
                        <div className="h-6 w-12 bg-zinc-900 rounded-lg"></div>
                      </div>
                    </div>

                    {/* Table/List Mock */}
                    <div className="bg-white border border-zinc-100 rounded-3xl shadow-sm overflow-hidden">
                       <div className="h-12 bg-zinc-50/50 border-b border-zinc-100 flex items-center px-6 justify-between">
                          <div className="h-2 w-24 bg-zinc-200 rounded-full"></div>
                          <div className="flex gap-4">
                            <div className="h-2 w-12 bg-zinc-100 rounded-full"></div>
                            <div className="h-2 w-12 bg-zinc-100 rounded-full"></div>
                          </div>
                       </div>
                       <div className="p-6 space-y-6">
                          {[1, 2].map(i => (
                            <div key={i} className="flex items-center justify-between pb-6 border-b border-zinc-50 last:border-0 last:pb-0">
                               <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-center">
                                     <div className="h-6 w-6 bg-sky-200/50 rounded-md"></div>
                                  </div>
                                  <div className="space-y-2">
                                     <div className="h-3 w-32 bg-zinc-800 rounded-full"></div>
                                     <div className="h-2 w-20 bg-zinc-400 rounded-full opacity-40"></div>
                                  </div>
                               </div>
                               <div className="flex gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-zinc-50"></div>
                                  <div className="h-8 w-8 rounded-lg bg-zinc-50"></div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="w-full max-w-7xl mt-40">
          <div className="text-center mb-24 px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-8 text-zinc-900">{t.features.title}</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-bold opacity-80">{t.features.desc}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-6">
            {t.features.list.map((feat, i) => (
              <div key={i} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-6 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-sm">
                  {i === 0 && <LayoutTemplate className="h-7 w-7" />}
                  {i === 1 && <ShoppingBag className="h-7 w-7" />}
                  {i === 2 && <BarChart2 className="h-7 w-7" />}
                  {i === 3 && <Zap className="h-7 w-7" />}
                  {i === 4 && <ShieldCheck className="h-7 w-7" />}
                  {i === 5 && <Globe className="h-7 w-7" />}
                </div>
                <h3 className="text-xl font-black text-zinc-900 mb-4">{feat.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-bold opacity-70">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="w-full max-w-5xl mx-auto mt-24 md:mt-32 bg-zinc-900 rounded-[2.5rem] md:rounded-[3rem] p-8 md:py-20 md:px-12 text-center relative overflow-hidden shadow-2xl shadow-zinc-200">
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
                <ul className="space-y-5 text-slate-400 text-sm font-bold">
                  {section.links.map((link, li) => (
                    <Link key={li} href={link === 'Pricing' || link === 'الأسعار' ? '/pricing' : '#'} className="text-slate-400 hover:text-sky-500 transition-colors font-bold text-sm block">{link}</Link>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-12 border-t border-slate-50 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] flex flex-col md:flex-row items-center justify-between gap-8">
            <p>© {new Date().getFullYear()} KayaMarket. {t.footer.rights}</p>
            <div className="flex items-center gap-8">
               <a href="#" className="hover:text-sky-500 transition-colors">Twitter</a>
               <a href="#" className="hover:text-sky-500 transition-colors">LinkedIn</a>
               <a href="#" className="hover:text-sky-500 transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
