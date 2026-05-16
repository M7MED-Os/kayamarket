'use client'

import React, { useState, useEffect } from 'react'
import { OrganicHeader, OrganicFooter, OrganicProductCard } from '../themes/OrganicTheme'
import { ChevronDown, ArrowLeft, Leaf, Star, ShieldCheck, Truck, Zap, MessageSquare, Sparkles, Check, Phone, Quote, ExternalLink, Award, Droplets, Heart, User, ShoppingBag, RefreshCw, Sparkle, Timer } from 'lucide-react'
import Link from 'next/link'

// ─── Dynamic Section Heading ─────────────────────────────────────────
function SectionHeading({ title, highlight, subtitle }: any) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 mb-16 px-4">
      <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 tracking-tighter">
        {title} <span className="text-[var(--primary)] italic font-serif font-normal">{highlight}</span>
      </h2>
      {subtitle && <p className="text-zinc-400 font-medium max-w-lg text-sm leading-relaxed">{subtitle}</p>}
    </div>
  )
}

export default function OrganicHome({ store, branding, slug, dbCategories, productsWithRatings, storeReviews, showWatermark, commonStyles }: any) {
  const primaryColor = branding?.primary_color || '#4A6741'
  const finalStyles = { ...commonStyles, '--primary': primaryColor, fontFamily: branding?.font_family || 'Cairo, sans-serif' }
  
  const heroTitle = branding?.hero_title || store.name
  const heroDesc = branding?.hero_description || store.description
  const heroImage = branding?.hero_image_url || 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?q=80&w=2070&auto=format&fit=crop'
  
  const products = productsWithRatings || []
  const features = branding?.features_data || []
  const testimonials = storeReviews?.length > 0 ? storeReviews : []

  return (
    <div className="min-h-screen bg-[#FDFCFB]" dir="rtl" style={finalStyles}>
      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(100%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .glass-badge { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.5); }
        @keyframes subtle-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .float-animation { animation: subtle-float 4s ease-in-out infinite; }
      `}</style>

      <OrganicHeader store={store} branding={branding} slug={slug} />

      <main className="overflow-hidden">
        {/* ════════════════════════════════════════ REFINED MINIMAL HERO */}
        <section className="relative min-h-[90vh] flex items-center pt-20 pb-16">
          <div className="absolute top-0 right-0 w-[35%] h-full bg-[var(--primary)]/5 -z-10 rounded-bl-[15rem]" />
          
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* ─── TEXT SIDE (RIGHT) ─── */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-right order-1">
              <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-white border border-zinc-100 rounded-full shadow-sm mx-auto lg:mr-0">
                 <Sparkle className="h-3 w-3 text-amber-500" />
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{branding?.hero_badge || 'إصدار فاخر'}</span>
              </div>

              <div className="space-y-4">
                <div className="relative inline-block">
                   <h1 className="text-5xl sm:text-[5.2rem] font-black leading-[1.1] tracking-tighter text-zinc-900 relative z-10">
                      {heroTitle}
                   </h1>
                   {/* Decorative underline/highlight */}
                   <div className="absolute -bottom-2 right-0 w-[60%] h-6 bg-[var(--primary)]/10 -rotate-1 rounded-full -z-10" />
                </div>
                <div 
                   className="text-base sm:text-lg text-zinc-400 font-medium max-w-lg mx-auto lg:mr-0 leading-relaxed"
                   dangerouslySetInnerHTML={{ __html: heroDesc.replace(/\n/g, '<br/>') }}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href={`/store/${slug}/products`} className="group relative w-full sm:w-auto px-12 py-5 bg-zinc-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-[var(--primary)] transition-all flex items-center justify-center gap-3">
                   اكتشف المنتجات
                   <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Link>
                
                {store.whatsapp_phone && (
                  <a href={`https://wa.me/${store.whatsapp_phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-12 py-5 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center justify-center gap-3">
                     تواصل معنا
                  </a>
                )}
              </div>

              {/* ─── TRUST BADGES (COLORED) ─── */}
              <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-90">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5" style={{ color: primaryColor }} />
                    <div className="text-right">
                       <p className="text-[9px] font-black text-zinc-900 uppercase">ثقة مضمونة</p>
                       <p className="text-[7px] font-bold text-zinc-400">تسوق آمن</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <Award className="h-5 w-5" style={{ color: primaryColor }} />
                    <div className="text-right">
                       <p className="text-[9px] font-black text-zinc-900 uppercase">جودة فائقة</p>
                       <p className="text-[7px] font-bold text-zinc-400">أصلي ١٠٠٪</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-3">
                    <Timer className="h-5 w-5" style={{ color: primaryColor }} />
                    <div className="text-right">
                       <p className="text-[9px] font-black text-zinc-900 uppercase">شحن سريع</p>
                       <p className="text-[7px] font-bold text-zinc-400">توصيل فوري</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* ─── IMAGE SIDE (LEFT) - CLEAN BOUTIQUE FRAME ─── */}
            <div className="lg:col-span-6 relative order-2">
               <div className="relative group">
                  {/* Clean Minimal Frame */}
                  <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white aspect-[4/5] sm:aspect-auto sm:h-[650px]">
                     <img src={heroImage} alt={heroTitle} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>

                  {/* Expert Badge - FIXED SIZE & STYLE */}
                  <div className="absolute top-10 -right-4 glass-badge w-24 h-24 rounded-full shadow-xl flex flex-col items-center justify-center text-center p-2 z-20 float-animation">
                     <Sparkles className="h-5 w-5 text-amber-500 mb-1" />
                     <p className="text-[9px] font-black text-zinc-800 leading-none">اختيار<br/>الخبراء</p>
                  </div>

                  {/* Lower Floating Badge */}
                  <div className="absolute bottom-10 -left-4 glass-badge px-6 py-4 rounded-[2rem] shadow-xl z-20 [animation-delay:2s] float-animation">
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-zinc-900 rounded-full flex items-center justify-center text-white">
                           <Zap className="h-4 w-4" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">فعالية مثالية</p>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════ DYNAMIC FEATURES */}
        <section className="py-24 bg-white">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {features.length > 0 ? features.map((feat: any, i: number) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-[var(--primary)] mb-6 transition-all duration-500 group-hover:bg-[var(--primary)] group-hover:text-white">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h4 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">{feat.title}</h4>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-[200px]">{feat.desc}</p>
                </div>
              )) : null}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════ PRODUCTS GRID */}
        <section className="py-24">
          <div className="max-w-[1400px] mx-auto px-6">
            <SectionHeading title={branding?.products_title || "أحدث"} highlight={branding?.products_highlight || "الإصدارات"} subtitle={branding?.products_subtitle} />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-10">
              {products.slice(0, 8).map((product: any) => (
                <OrganicProductCard key={product.id} product={product} slug={slug} />
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════ TESTIMONIALS */}
        <section className="py-24 bg-[#FAF9F6] overflow-hidden relative border-y border-zinc-100">
           <SectionHeading title="آراء" highlight="عميلاتنا" />
           <div className="relative flex overflow-x-hidden">
              <div className="flex gap-8 animate-marquee whitespace-nowrap">
                {testimonials.length > 0 ? [...testimonials, ...testimonials, ...testimonials].map((t: any, i: number) => (
                  <div key={i} className="inline-block w-[300px] p-10 rounded-[3rem] bg-white border border-zinc-100 shadow-sm shrink-0">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300">
                           <User className="h-6 w-6" />
                        </div>
                        <div className="text-right">
                           <h5 className="text-sm font-black text-zinc-900">{t.name || 'عميلة راضية'}</h5>
                           <div className="flex items-center gap-1 mt-1">
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                           </div>
                        </div>
                     </div>
                     <div 
                        className="text-xs text-zinc-500 font-medium leading-relaxed whitespace-normal italic"
                        dangerouslySetInnerHTML={{ __html: `"${t.comment?.replace(/\n/g, '<br/>') || ''}"` }}
                     />
                  </div>
                )) : null}
              </div>
           </div>
        </section>

        {/* ════════════════════════════════════════ FAQ */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <SectionHeading title="الأسئلة" highlight="المتكررة" />
            <div className="space-y-12">
              {(branding?.faq_data || []).map((faq: any, i: number) => (
                <div key={i} className="group relative pr-16 pb-10 border-b border-zinc-50 last:border-0">
                   <span className="absolute top-0 right-0 text-[var(--primary)] font-black text-sm opacity-30">
                     {String(i + 1).padStart(2, '0')}
                   </span>
                   <h4 className="text-xl font-black text-zinc-900 mb-4 group-hover:text-[var(--primary)] transition-colors">{faq.q}</h4>
                   <div 
                     className="text-zinc-500 text-sm font-medium leading-relaxed"
                     dangerouslySetInnerHTML={{ __html: faq.a.replace(/\n/g, '<br/>') }}
                   />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <OrganicFooter store={store} branding={branding} slug={slug} showWatermark={showWatermark} categories={dbCategories} />
    </div>
  )
}
