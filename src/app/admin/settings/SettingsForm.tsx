'use client'

import { useState, useEffect } from 'react'
import { updateStoreSettings } from '@/app/actions/settings'
import toast from 'react-hot-toast'
import Link from 'next/link'
import {
   Palette, Globe, Landmark, Shield, Layout, Save, Loader2,
   ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight,
   Sparkles, Settings2, Phone, MessageSquare, CreditCard,
   ImageIcon as BannerIcon, Type, Smartphone, Laptop,
   Activity, Eye, EyeOff, GripVertical, ChevronLeft,
   Layers, Brush, Building2, BellRing, Info, Share2,
   CheckCircle2, Clock, SmartphoneIcon, MonitorIcon, Truck, ShieldCheck, Headphones, Calendar, Store,
   ChevronRight, ArrowLeft, MoreHorizontal, Check, Wallet, MousePointer2, MapPin,
   Copy, Trash2, Maximize2, UploadCloud, ArrowRight, Hash, Percent, Zap, Package, X, Lock
} from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import { useSearchParams, useRouter } from 'next/navigation'

type ViewType = 'hub' | 'builder' | 'branding' | 'media' | 'identity' | 'checkout' | 'plan' | 'upgrade-checkout' | 'themes' | 'tracking'

interface Section {
   id: string
   enabled: boolean
   label: string
}

import { PlanTier, PLAN_CONFIG, getPlanName } from '@/lib/subscription'
import UpgradeModal from '@/components/UpgradeModal'

import { submitUpgradeRequest } from '@/app/actions/subscription'

export default function SettingsForm({ 
   initialStore, 
   initialBranding, 
   initialSettings, 
   plan = 'starter', 
   allPlans, 
   userEmail,
   themes = [],
   platformSettings
}: { 
   initialStore: any, 
   initialBranding: any, 
   initialSettings: any, 
   plan?: PlanTier, 
   allPlans?: any, 
   userEmail?: string,
   themes?: any[],
   platformSettings?: any
}) {
   // Defensive check: if plan is invalid or not found in PLAN_CONFIG, fallback to starter
   const currentPlan = ((plan as string) === 'free' ? 'starter' : plan) as PlanTier
   const config = allPlans?.[currentPlan] || PLAN_CONFIG[currentPlan] || PLAN_CONFIG.starter
   const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, name: '', description: '' })
   const [loading, setLoading] = useState(false)
   const [submittingUpgrade, setSubmittingUpgrade] = useState(false)
   const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<PlanTier | null>(null)
   const [senderPhone, setSenderPhone] = useState('')
   const [receiptUrl, setReceiptUrl] = useState('')
   const searchParams = useSearchParams()
   const router = useRouter()
   const currentView = (searchParams.get('tab') as ViewType) || 'hub'

   // Branding
   const [primaryColor, setPrimaryColor] = useState(initialBranding?.primary_color || '#0ea5e9')
   const [secondaryColor, setSecondaryColor] = useState(initialBranding?.secondary_color || '#f8fafc')
   const [fontFamily, setFontFamily] = useState(initialBranding?.font_family || 'Cairo')
   const [logoUrl, setLogoUrl] = useState(initialBranding?.logo_url || '')
   const [bannerUrl, setBannerUrl] = useState(initialBranding?.banner_url || '')
   const [faviconUrl, setFaviconUrl] = useState(initialBranding?.favicon_url || '')
   const [invoiceInstapay, setInvoiceInstapay] = useState(initialBranding?.invoice_instapay || '')
   const [invoiceWallet, setInvoiceWallet] = useState(initialBranding?.invoice_wallet || '')
   const [selectedTheme, setSelectedTheme] = useState(initialBranding?.selected_theme || 'default')

   // Helper to generate shades for secondary color
   const getSecondaryPresets = (primary: string) => {
      // HEXA tricks for shades (approximate)
      const base = primary.substring(0, 7)
      return [
         base,
         `${base}05`, // Extremely faint
         `${base}15`, // Very light
         `${base}30`, // Light
         `${base}60`, // Medium
         '#ffffff'    // Pure White
      ]
   }

   // Identity
   const [storeName, setStoreName] = useState(initialStore?.name || '')
   const [whatsappPhone, setWhatsappPhone] = useState(initialStore?.whatsapp_phone || '')
   const [customDomain, setCustomDomain] = useState(initialStore?.custom_domain || '')
   const [tagline, setTagline] = useState(initialBranding?.tagline || '')
   const [footerText, setFooterText] = useState(initialBranding?.footer_text || '')

   // Social
   const [facebookUrl, setFacebookUrl] = useState(initialBranding?.facebook_url || '')
   const [instagramUrl, setInstagramUrl] = useState(initialBranding?.instagram_url || '')
   const [tiktokUrl, setTiktokUrl] = useState(initialBranding?.tiktok_url || '')
   const [storeAddress, setStoreAddress] = useState(initialBranding?.address || '')

   const DEFAULT_SECTIONS: Section[] = [
      { id: 'announcement', enabled: true, label: 'شريط الإعلانات' },
      { id: 'header', enabled: true, label: 'رأس الصفحة' },
      { id: 'hero', enabled: true, label: 'واجهة الترحيب' },
      { id: 'categories', enabled: true, label: 'أقسام المتجر' },
      { id: 'bestsellers', enabled: true, label: 'الأكثر مبيعاً' },
      { id: 'features', enabled: true, label: 'المميزات' },
      { id: 'testimonials', enabled: true, label: 'آراء العملاء' },
      { id: 'faq', enabled: true, label: 'الأسئلة الشائعة' },
      { id: 'footer', enabled: true, label: 'تذييل الصفحة' }
   ]

   // Initialize sections by merging DB state with default labels
   const [sections, setSections] = useState<Section[]>(() => {
      if (!initialBranding?.sections || !Array.isArray(initialBranding.sections)) {
         return DEFAULT_SECTIONS
      }

      // Merge: Use DB label if present, otherwise fallback to default
      return initialBranding.sections.map((dbSection: any) => {
         const defaultInfo = DEFAULT_SECTIONS.find(s => s.id === dbSection.id)
         return {
            ...dbSection,
            label: dbSection.label || defaultInfo?.label || 'قسم غير معروف'
         }
      })
   })

   // Sub-settings
   const [headerSettings, setHeaderSettings] = useState(initialBranding?.header_settings || { layout: 'right', sticky: true })
   const [heroTitle, setHeroTitle] = useState(initialBranding?.hero_title || '')
   const [heroDescription, setHeroDescription] = useState(initialBranding?.hero_description || '')
   const [announcementText, setAnnouncementText] = useState(initialBranding?.announcement_text || '')
   const [announcementEnabled, setAnnouncementEnabled] = useState(initialBranding?.announcement_enabled ?? true)
   const [showHeroMobile, setShowHeroMobile] = useState(initialBranding?.show_hero_mobile ?? true)

   // Premium Builder States
   const [heroAlignment, setHeroAlignment] = useState(initialBranding?.hero_alignment || 'right')
   const [heroImageUrl, setHeroImageUrl] = useState(initialBranding?.hero_image_url || '')
   const [heroCtaText, setHeroCtaText] = useState(initialBranding?.hero_cta_text || 'تسوق الآن')
   const [bannerOverlayOpacity, setBannerOverlayOpacity] = useState(initialBranding?.banner_overlay_opacity || 50)
   const [featuresData, setFeaturesData] = useState(initialBranding?.features_data || [
      { id: 'shipping', title: 'شحن سريع', desc: 'توصيل آمن وسريع لكافة المناطق' },
      { id: 'quality', title: 'جودة عالية', desc: 'منتجات مختارة بعناية فائقة' },
      { id: 'speed', title: 'سرعة التنفيذ', desc: 'نجهز طلبك في وقت قياسي' },
      { id: 'service', title: 'خدمة عملاء', desc: 'دعم فني متواصل على مدار الساعة' }
   ])
   const [footerDescription, setFooterDescription] = useState(initialBranding?.footer_description || '')
   const [faqData, setFaqData] = useState(initialBranding?.faq_data || [
      { q: 'كم يستغرق توصيل الطلب؟', a: 'يستغرق التوصيل عادةً من 2 إلى 5 أيام عمل حسب منطقتك.' },
      { q: 'هل يمكنني إرجاع أو استبدال المنتج؟', a: 'نعم، يمكنك الإرجاع خلال 14 يوماً من تاريخ الاستلام.' },
      { q: 'ما هي طرق الدفع المتاحة؟', a: 'نوفر الدفع عند الاستلام، والمحافظ الإلكترونية، والتحويل البنكي.' },
      { q: 'كيف يمكنني تتبع طلبي؟', a: 'سيتم إرسال رابط تتبع عبر الواتساب فور تأكيد طلبك.' },
   ])

   // Payments & Policies
   const [codEnabled, setCodEnabled] = useState(initialSettings?.cod_enabled ?? true)
   const [codDepositRequired, setCodDepositRequired] = useState(initialSettings?.cod_deposit_required ?? false)
   const [depositPercentage, setDepositPercentage] = useState(initialSettings?.deposit_percentage || 50)
   const [policies, setPolicies] = useState(initialSettings?.policies || '')
   const [fbPixelId, setFbPixelId] = useState(initialSettings?.fb_pixel_id || '')
   const [tiktokPixelId, setTiktokPixelId] = useState(initialSettings?.tiktok_pixel_id || '')
   const [googleAnalyticsId, setGoogleAnalyticsId] = useState(initialSettings?.google_analytics_id || '')

   // Shipping Config
   const [shippingConfig, setShippingConfig] = useState(initialBranding?.shipping_config || { type: 'flat', flat_rate: 0, governorates: {}, allow_pickup: false })

   const GOVERNORATES = [
      "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "السويس", "الشرقية", "دمياط", "بورسعيد", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا", "شمال سيناء", "سوهاج", "بني سويف", "أسيوط", "أسوان"
   ]

   const handleShippingTypeChange = (type: string) => {
      let newConfig = { ...shippingConfig, type }
      
      // Smart Populate: If switching to per_governorate and we have a flat rate, fill all governorates with it
      if (type === 'per_governorate') {
         const currentGovs = shippingConfig.governorates || {}
         const hasData = Object.values(currentGovs).some(v => Number(v) > 0)
         
         if (!hasData && shippingConfig.flat_rate > 0) {
            const newGovs: any = {}
            GOVERNORATES.forEach(g => newGovs[g] = shippingConfig.flat_rate)
            newConfig.governorates = newGovs
         }
      }
      
      setShippingConfig(newConfig)
   }

   const [hasChanges, setHasChanges] = useState(false)
   const [isLoaded, setIsLoaded] = useState(false)

   // Calculate next plan for upgrade display
   const planTiers: PlanTier[] = ['starter', 'growth', 'pro']
   const nextTier = planTiers[planTiers.indexOf(currentPlan) + 1]
   const nextPlan = nextTier ? allPlans?.[nextTier] : null

   useEffect(() => {
      if (!isLoaded) { setIsLoaded(true); return }
      setHasChanges(true)
   }, [
      primaryColor, secondaryColor, fontFamily, logoUrl, bannerUrl, faviconUrl,
      storeName, whatsappPhone, customDomain, tagline, footerText,
      sections, headerSettings, showHeroMobile, heroTitle, heroDescription, announcementText, announcementEnabled,
      facebookUrl, instagramUrl, tiktokUrl, storeAddress, codEnabled, codDepositRequired, depositPercentage, policies,
      heroAlignment, heroImageUrl, heroCtaText, bannerOverlayOpacity, featuresData, footerDescription,
      invoiceInstapay, invoiceWallet, faqData, selectedTheme, shippingConfig,
      fbPixelId, tiktokPixelId, googleAnalyticsId
   ])

   const toggleSection = (id: string) => {
      setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
   }

   const updateSectionLabel = (id: string, newLabel: string) => {
      setSections(prev => prev.map(s => s.id === id ? { ...s, label: newLabel } : s))
   }

   const isSectionOn = (id: string) => sections.find(s => s.id === id)?.enabled !== false

   const handleSubmit = async () => {
      setLoading(true)
      try {
         const formData = new FormData()
         formData.append('store_name', storeName); formData.append('whatsapp_phone', whatsappPhone)
         formData.append('custom_domain', customDomain)
         formData.append('primary_color', primaryColor); formData.append('secondary_color', secondaryColor)
         formData.append('font_family', fontFamily);
         formData.append('logo_url', logoUrl); formData.append('banner_url', bannerUrl); formData.append('favicon_url', faviconUrl)
         formData.append('tagline', tagline); formData.append('footer_text', footerText); formData.append('hero_title', heroTitle)
         formData.append('hero_description', heroDescription); formData.append('announcement_text', announcementText)
         formData.append('facebook_url', facebookUrl); formData.append('instagram_url', instagramUrl)
         formData.append('tiktok_url', tiktokUrl); formData.append('address', storeAddress)
         formData.append('invoice_instapay', invoiceInstapay)
         formData.append('invoice_wallet', invoiceWallet)
         formData.append('sections', JSON.stringify(sections))
         formData.append('header_settings', JSON.stringify(headerSettings))
         formData.append('footer_settings', JSON.stringify({})) // Placeholder or merge with footerDescription

         // New Fields
         formData.append('hero_alignment', heroAlignment)
         formData.append('hero_image_url', heroImageUrl)
         formData.append('hero_cta_text', heroCtaText)
         formData.append('banner_overlay_opacity', bannerOverlayOpacity.toString())
         formData.append('features_data', JSON.stringify(featuresData))
         formData.append('footer_description', footerDescription)
         formData.append('faq_data', JSON.stringify(faqData))
         formData.append('announcement_enabled', announcementEnabled.toString())
         formData.append('selected_theme', selectedTheme)
         formData.append('show_hero_mobile', showHeroMobile.toString())
         formData.append('cod_enabled', codEnabled.toString())
         formData.append('cod_deposit_required', codDepositRequired.toString())
         formData.append('deposit_percentage', depositPercentage.toString())
         formData.append('policies', policies)
         formData.append('shipping_config', JSON.stringify(shippingConfig))
         formData.append('fb_pixel_id', fbPixelId)
         formData.append('tiktok_pixel_id', tiktokPixelId)
         formData.append('google_analytics_id', googleAnalyticsId)

         const res = await updateStoreSettings(formData)
         if (res.success) {
            toast.success('تم حفظ جميع الإعدادات بنجاح')
            setHasChanges(false)
            router.refresh()
         } else {
            if (res.code === 'BRANDING_LOCKED' || res.code === 'DOMAIN_LOCKED' || res.code === 'HERO_IMAGE_LOCKED') {
               setUpgradeModal({
                  isOpen: true,
                  name: res.code === 'BRANDING_LOCKED' ? 'الهوية البصرية' : 
                        res.code === 'HERO_IMAGE_LOCKED' ? 'صورة الواجهة' : 'الدومين المخصص',
                  description: res.error
               })
            } else {
               toast.error(res.error || 'حدث خطأ أثناء الحفظ')
            }
         }
         setLoading(false)
      } catch { toast.error('خطأ') } finally { setLoading(false) }
   }

   const hubItems = [
      { id: 'themes', label: 'قوالب المتجر', icon: Palette, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { id: 'builder', label: 'تنسيق المتجر', icon: Layout, color: 'text-blue-600', bg: 'bg-blue-50' },
      { id: 'branding', label: 'الألوان والخطوط', icon: Brush, color: 'text-purple-600', bg: 'bg-purple-50' },
      { id: 'media', label: 'الشعار والبانر', icon: BannerIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
      { id: 'identity', label: 'المعلومات', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { id: 'checkout', label: 'الدفع والسياسات', icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50' },
      { id: 'tracking', label: 'التتبع والتحليلات', icon: Activity, color: 'text-cyan-600', bg: 'bg-cyan-50' },
      { id: 'plan', label: 'خطة الاشتراك', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
   ]

   const AVAILABLE_THEMES = themes.length > 0 ? themes.map(t => ({
      id: t.id,
      name: t.name,
      desc: t.description,
      requiredPlan: t.required_plan,
      preview: t.preview_url
   })) : [
      {
         id: 'default',
         name: 'الافتراضي (Premium Mesh)',
         desc: 'تصميم عصري بخلفيات متدرجة وتأثيرات زجاجية، مثالي للمتاجر التي تبحث عن مظهر فخم.',
         requiredPlan: 'starter',
         preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'
      },
      {
         id: 'organic',
         name: 'الطبيعة (Organic Eco)',
         desc: 'تصميم طبيعي وهادئ يعتمد على الألوان الترابية والمنحنيات الناعمة، مثالي للمنتجات العضوية والمستدامة.',
         requiredPlan: 'starter',
         preview: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop'
      }
   ]

   const setView = (v: ViewType) => router.push(`/admin/settings?tab=${v}`)

   return (
      <div className="max-w-7xl mr-0 ml-auto px-4 md:px-8 py-6" dir="rtl">

         {/* ── Hub View ────────────────────────────────────────────── */}
         {currentView === 'hub' && (
            <div className="animate-in fade-in zoom-in-95 duration-700 max-w-[1200px] mx-auto space-y-12">
               <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">إعدادات المنصة</h2>
                  <p className="text-slate-400 text-lg font-bold">تحكم في مظهر متجرك، هويته، وطرق الدفع بكل سهولة.</p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {hubItems.map(item => (
                     <button
                        key={item.id}
                        onClick={() => setView(item.id as ViewType)}
                        className="group flex flex-col items-center justify-center gap-6 bg-white border border-slate-100 p-10 md:p-12 rounded-[3.5rem] transition-all duration-500 hover:border-sky-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] active:scale-95 text-center relative overflow-hidden"
                     >
                        <div className={`absolute -right-6 -top-6 h-32 w-32 ${item.bg} opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full blur-3xl`} />

                        <div className={`h-20 w-20 md:h-24 md:w-24 ${item.bg} ${item.color} rounded-[2rem] flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                           <item.icon className="h-10 w-10 md:h-12 md:w-12" strokeWidth={2.5} />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-sky-600 transition-colors">{item.label}</h3>
                           <p className="text-xs font-bold text-slate-400">تخصيص كامل لـ {item.label.toLowerCase()}</p>
                        </div>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                           <div className="h-2 w-10 bg-sky-500 rounded-full" />
                        </div>
                     </button>
                  ))}
               </div>
            </div>
         )}

         {/* ── Detail Views ────────────────────────────────────────── */}
         {currentView !== 'hub' && (
            <>

               {/* Top Sticky Header - Responsive Labels */}
               <div className="sticky top-16 xl:top-0 bg-slate-50/95 backdrop-blur-2xl py-4 md:py-6 mb-0 flex items-center justify-between -mx-4 px-4 md:-mx-8 md:px-8" style={{ zIndex: 99999 }}>
                  <div className="flex items-center gap-4">
                     <button
                        onClick={() => setView('hub')}
                        className="group flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3.5 bg-white border border-slate-200 rounded-2xl md:rounded-[1.5rem] text-slate-500 hover:text-slate-900 hover:border-slate-900 transition-all active:scale-90 shadow-sm hover:shadow-md"
                     >
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        <span className="hidden sm:inline text-sm md:text-base font-black">العودة</span>
                     </button>
                     <h2 className="text-lg md:text-3xl font-black text-slate-900 tracking-tight px-2 truncate">
                        {hubItems.find(i => i.id === currentView)?.label}
                     </h2>
                  </div>

                  <div className="flex items-center gap-4">
                     {hasChanges ? (
                        <button
                           onClick={handleSubmit}
                           disabled={loading}
                           className="flex items-center gap-2 md:gap-3 bg-sky-500 text-white px-5 md:px-12 py-2.5 md:py-4 rounded-2xl md:rounded-[1.5rem] text-sm font-black shadow-xl shadow-sky-100 hover:bg-sky-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                           {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 md:h-5 md:w-5" />}
                           <span className="hidden sm:inline">حفظ التغييرات</span>
                        </button>
                     ) : (
                        <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">
                           لا توجد تعديلات
                        </div>
                     )}
                  </div>
               </div>

               <div className="max-w-full space-y-10 animate-in slide-in-from-left-4 duration-500 pb-20 mt-[45px]">

                  {/* Themes Selection View */}
                  {currentView === 'themes' && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {AVAILABLE_THEMES.map((theme) => {
                              const isLocked = plan === 'starter' && theme.requiredPlan !== 'starter'
                              const isActive = selectedTheme === theme.id

                              return (
                                 <div
                                    key={theme.id}
                                    className={`group relative flex flex-col bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden shadow-sm
                                 ${isActive ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-indigo-100' : 'border-slate-100 hover:border-slate-300'}
                                 ${isLocked ? 'grayscale-[0.5] opacity-80' : ''}`}
                                 >
                                    <div className="relative h-52 overflow-hidden">
                                       <img src={theme.preview} alt={theme.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                       {isActive && (
                                          <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                                             <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                مفعل حالياً
                                             </div>
                                          </div>
                                       )}
                                       {isLocked && (
                                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                             <div className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-[10px] font-black shadow-lg flex items-center gap-2 uppercase tracking-widest">
                                                <Lock className="h-4 w-4" />
                                                يتطلب ترقية
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                    <div className="p-8 flex flex-col flex-1 gap-4">
                                       <div className="space-y-1">
                                          <h4 className="text-xl font-black text-slate-900">{theme.name}</h4>
                                          <p className="text-xs font-bold text-slate-400 leading-relaxed">{theme.desc}</p>
                                       </div>
                                       <div className="mt-auto pt-4 flex items-center justify-between">
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                             {theme.requiredPlan === 'starter' ? 'مجاني للجميع' : `باقة ${getPlanName(theme.requiredPlan as any)}`}
                                          </span>
                                          {!isActive && !isLocked && (
                                             <button
                                                onClick={() => setSelectedTheme(theme.id)}
                                                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
                                             >
                                                تفعيل الثيم
                                             </button>
                                          )}
                                          {isLocked && (
                                             <button
                                                onClick={() => setView('plan')}
                                                className="bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all"
                                             >
                                                ترقية الآن
                                             </button>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              )
                           })}
                        </div>
                     </div>
                  )}

                  {/* Structured Builder View */}
                  {currentView === 'builder' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* 1. Announcement Bar - Compact */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
                           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                    <BellRing className="h-5 w-5" />
                                 </div>
                                 <div className="text-right">
                                    <h3 className="text-base font-black text-slate-900">شريط الإعلانات</h3>
                                    <p className="text-[10px] font-bold text-slate-400">تفعيل أو تخصيص نص الإعلان العلوي</p>
                                 </div>
                              </div>

                              <div className="flex items-center gap-4 w-full sm:w-auto">
                                 {announcementEnabled && (
                                    <input
                                       value={announcementText}
                                       onChange={e => setAnnouncementText(e.target.value)}
                                       placeholder="نص الإعلان..."
                                       className="flex-1 sm:w-64 h-10 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-black outline-none focus:bg-white focus:border-slate-900 transition-all"
                                    />
                                 )}
                                 <button
                                    onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                                    className={`h-7 w-12 rounded-full relative flex items-center transition-all shrink-0 ${announcementEnabled ? 'bg-slate-900 shadow-lg' : 'bg-slate-200'}`}
                                 >
                                    <div className={`h-5 w-5 rounded-full bg-white transition-all ${announcementEnabled ? 'mr-6' : 'mr-1'}`} />
                                 </button>
                              </div>
                           </div>
                        </div>

                        {/* 2. Hero Section - Compact */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                 <Layout className="h-5 w-5" />
                              </div>
                              <div className="text-right">
                                 <h3 className="text-lg font-black text-slate-900">واجهة الترحيب (Hero)</h3>
                                 <p className="text-[10px] font-bold text-slate-400">تخصيص العناوين وتنسيق الواجهة</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                              <div className="space-y-4 text-right">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase px-1">العنوان الرئيسي</label>
                                    <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-black outline-none focus:bg-white focus:border-slate-900" />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase px-1">الوصف الفرعي</label>
                                    <textarea value={heroDescription} onChange={e => setHeroDescription(e.target.value)} className="w-full h-24 bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold outline-none focus:bg-white focus:border-slate-900 resize-none" />
                                 </div>
                              </div>

                              <div className="space-y-4 text-right">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase px-1">تنسيق النص</label>
                                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl">
                                       {[
                                          { id: 'right', label: 'يمين', icon: AlignRight },
                                          { id: 'center', label: 'وسط', icon: AlignCenter },
                                          { id: 'left', label: 'يسار', icon: AlignLeft }
                                       ].map(align => (
                                          <button
                                             key={align.id}
                                             onClick={() => setHeroAlignment(align.id)}
                                             type="button"
                                             className={`h-9 rounded-lg flex items-center justify-center gap-2 text-[11px] font-black transition-all ${heroAlignment === align.id ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                          >
                                             <align.icon className="h-3.5 w-3.5" />
                                             {align.label}
                                          </button>
                                       ))}
                                    </div>
                                 </div>

                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase px-1">نص زر الشراء</label>
                                    <input value={heroCtaText} onChange={e => setHeroCtaText(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-black outline-none focus:bg-white focus:border-slate-900" />
                                 </div>
                              </div>
                           </div>

                           <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row items-center gap-8">
                              <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 shrink-0">
                                 <span className="text-[10px] font-black text-slate-500 whitespace-nowrap">إظهار الصورة في الجوال</span>
                                 <button
                                    type="button"
                                    onClick={() => setShowHeroMobile(!showHeroMobile)}
                                    className={`h-6 w-11 rounded-full relative flex items-center transition-all shrink-0 ${showHeroMobile ? 'bg-slate-900 shadow-lg' : 'bg-slate-200'}`}
                                 >
                                    <div className={`h-4 w-4 rounded-full bg-white transition-all ${showHeroMobile ? 'mr-6' : 'mr-1'}`} />
                                 </button>
                              </div>

                              <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-6 w-full">
                                 <div className="text-right flex-shrink-0">
                                    <h4 className="text-xs font-black text-slate-800">شفافية غطاء البانر</h4>
                                    <p className="text-[10px] font-bold text-slate-400">تعتيم الصورة لتوضيح النص</p>
                                 </div>
                                 <div className="flex items-center gap-4 flex-1 max-w-md w-full">
                                    <input
                                       type="range" min="0" max="90" step="5"
                                       value={bannerOverlayOpacity}
                                       onChange={e => setBannerOverlayOpacity(parseInt(e.target.value))}
                                       className="flex-1 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                                    />
                                    <div className="flex items-center gap-2">
                                       <div className="h-6 w-10 rounded-md overflow-hidden relative border border-slate-200 shrink-0" style={{ backgroundColor: primaryColor }}>
                                          <div className="absolute inset-0 bg-black" style={{ opacity: bannerOverlayOpacity / 100 }} />
                                       </div>
                                       <span className="text-[11px] font-black text-slate-900 bg-slate-50 w-10 text-center py-1 rounded-md border border-slate-100 shrink-0" dir="ltr">{bannerOverlayOpacity}%</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* 3. Features Section - Compact */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                 <Sparkles className="h-5 w-5" />
                              </div>
                              <div className="text-right">
                                 <h3 className="text-lg font-black text-slate-900">مميزات المتجر</h3>
                                 <p className="text-[10px] font-bold text-slate-400">القيم الأساسية التي تظهر لعملائك</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {featuresData.map((feat: any, idx: number) => {
                                 const Icon = idx === 0 ? Truck : idx === 1 ? ShieldCheck : idx === 2 ? Zap : Headphones
                                 return (
                                    <div key={feat.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3 hover:border-emerald-100 transition-colors group text-right">
                                       <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 bg-white text-slate-900 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                                             <Icon className="h-4 w-4" />
                                          </div>
                                          <input
                                             value={feat.title}
                                             onChange={e => {
                                                const newFeats = [...featuresData]
                                                newFeats[idx].title = e.target.value
                                                setFeaturesData(newFeats)
                                             }}
                                             className="bg-transparent border-none p-0 text-xs font-black text-slate-900 outline-none w-full text-right"
                                             placeholder="العنوان..."
                                          />
                                       </div>
                                       <textarea
                                          value={feat.desc}
                                          onChange={e => {
                                             const newFeats = [...featuresData]
                                             newFeats[idx].desc = e.target.value
                                             setFeaturesData(newFeats)
                                          }}
                                          className="w-full bg-transparent border-none p-0 text-[10px] font-bold text-slate-400 outline-none resize-none leading-relaxed text-right"
                                          placeholder="الوصف..."
                                          rows={2}
                                       />
                                    </div>
                                 )
                              })}
                           </div>
                        </div>

                        {/* 4. FAQ Editor */}
                        {isSectionOn('faq') && (
                           <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
                              <div className="flex items-center gap-3 mb-2">
                                 <div className="h-10 w-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Info className="h-5 w-5" />
                                 </div>
                                 <div className="text-right">
                                    <h3 className="text-lg font-black text-slate-900">محرر الأسئلة الشائعة</h3>
                                    <p className="text-[10px] font-bold text-slate-400">أضف أو عدل الأسئلة التي تهم عملائك</p>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 {faqData.map((faq: any, idx: number) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 text-right group relative">
                                       <div className="flex items-center justify-between gap-2">
                                          <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-100 px-2.5 py-1 rounded-full">سؤال {idx + 1}</span>
                                          {faqData.length > 1 && (
                                             <button onClick={() => setFaqData((prev: any[]) => prev.filter((_: any, i: number) => i !== idx))} className="text-rose-500 hover:text-rose-700 p-1">
                                                <Trash2 className="h-4 w-4" />
                                             </button>
                                          )}
                                       </div>
                                       <input value={faq.q} onChange={e => { const n = [...faqData]; n[idx].q = e.target.value; setFaqData(n) }} placeholder="اكتب السؤال هنا..." className="w-full bg-white border border-slate-100 rounded-xl px-4 h-11 text-xs font-black outline-none focus:border-slate-900" />
                                       <textarea value={faq.a} onChange={e => { const n = [...faqData]; n[idx].a = e.target.value; setFaqData(n) }} placeholder="اكتب الإجابة هنا..." rows={2} className="w-full bg-white border border-slate-100 rounded-xl p-4 text-xs font-bold outline-none focus:border-slate-900 resize-none" />
                                    </div>
                                 ))}
                                 {faqData.length < 10 && (
                                    <button onClick={() => setFaqData((prev: any[]) => [...prev, { q: '', a: '' }])} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-black text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2">
                                       <Sparkles className="h-4 w-4" />
                                       إضافة سؤال جديد
                                    </button>
                                 )}
                              </div>
                           </div>
                        )}

                        {/* 5. Footer Section - Reordered to Bottom */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                           <div className="flex items-center gap-3 mb-6">
                              <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                                 <AlignLeft className="h-5 w-5" />
                              </div>
                              <div className="text-right">
                                 <h3 className="text-lg font-black text-slate-900">تذييل الصفحة (Footer)</h3>
                                 <p className="text-[10px] font-bold text-slate-400">وصف المتجر في أسفل الموقع</p>
                              </div>
                           </div>

                           <div className="space-y-2 text-right">
                              <label className="text-[10px] font-black text-slate-400 uppercase px-1">وصف المتجر في الفوتر</label>
                              <textarea
                                 value={footerDescription}
                                 onChange={e => setFooterDescription(e.target.value)}
                                 placeholder="اكتب وصفاً مختصراً لمتجرك..."
                                 className="w-full h-24 bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold outline-none focus:bg-white focus:border-slate-900 resize-none transition-all text-right"
                              />
                           </div>
                        </div>
                     </div>
                  )}



                  {/* Branding View */}
                  {currentView === 'branding' && (
                     <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
                        {/* Colors Section - Compact */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
                           <div className="flex items-center gap-3 mb-6">
                              <div className="h-10 w-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                                 <Palette className="h-5 w-5" />
                              </div>
                              <div className="text-right">
                                 <h3 className="text-lg font-black text-slate-900">هوية الألوان</h3>
                                 <p className="text-[10px] font-bold text-slate-400 mt-1">اختر ألواناً تعبر عن علامتك التجارية</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                              {[
                                 { label: 'اللون الأساسي', value: primaryColor, setter: setPrimaryColor, desc: 'للأزرار والروابط' },
                                 { label: 'اللون الثانوي', value: secondaryColor, setter: setSecondaryColor, desc: 'للخلفيات والظلال' }
                              ].map(color => (
                                 <div key={color.label} className="space-y-3 text-right">
                                    <div className="flex flex-col gap-1 px-1">
                                       <h4 className="text-sm font-black text-slate-800">{color.label}</h4>
                                       <p className="text-[10px] font-bold text-slate-400">{color.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all shadow-sm group relative" dir="ltr">
                                       <div className="flex-1 flex items-center px-2">
                                          <Hash className="h-4 w-4 text-slate-300 mr-2" />
                                          <input
                                             value={color.value.replace('#', '')}
                                             onChange={e => {
                                                const val = e.target.value;
                                                if (val.length <= 6) color.setter('#' + val.replace(/[^0-9A-Fa-f]/g, ''))
                                             }}
                                             className="w-full bg-transparent text-sm font-black outline-none font-inter uppercase tracking-widest text-slate-600"
                                          />
                                       </div>
                                       <div
                                          className="relative h-10 w-10 shrink-0 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                                          style={{ backgroundColor: color.value.substring(0, 7) }}
                                          onClick={(e) => {
                                             const input = e.currentTarget.querySelector('input');
                                             if (input) input.click();
                                          }}
                                       >
                                          <input
                                             type="color"
                                             value={color.value.substring(0, 7)}
                                             onChange={e => color.setter(e.target.value)}
                                             className="absolute inset-0 opacity-0 h-full w-full cursor-pointer"
                                          />
                                       </div>
                                    </div>
                                    {/* Presets */}
                                    <div className="flex flex-wrap gap-2 px-1">
                                       {(color.label === 'اللون الأساسي' ? ['#0ea5e9', '#e11d48', '#10b981', '#f59e0b', '#000000'] : getSecondaryPresets(primaryColor)).map(p => (
                                          <button
                                             key={p}
                                             onClick={() => color.setter(p)}
                                             className={`h-6 w-6 rounded-full border transition-all hover:scale-110 ${color.value === p ? 'border-slate-900 shadow-md ring-2 ring-slate-900/20' : 'border-slate-200'}`}
                                             style={{ backgroundColor: p.substring(0, 7) }}
                                             title={p}
                                          >
                                             {p.length > 7 && <div className="h-full w-full rounded-full bg-white/40" />}
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Fonts Section - Compact */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                           <div className="flex items-center gap-3 mb-8">
                              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                 <Type className="h-5 w-5" />
                              </div>
                              <div className="text-right">
                                 <h3 className="text-lg font-black text-slate-900">الخطوط المتاحة</h3>
                                 <p className="text-[10px] font-bold text-slate-400 mt-1">اختر الخط الذي يسهل قراءته لعملائك</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {[
                                 { name: 'Cairo', desc: 'عصري وواضح' },
                                 { name: 'Tajawal', desc: 'ناعم وأنيق' },
                                 { name: 'Almarai', desc: 'رسمي واحترافي' }
                              ].map(font => (
                                 <button
                                    key={font.name}
                                    onClick={() => setFontFamily(font.name)}
                                    className={`group relative h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 overflow-hidden
                                 ${fontFamily === font.name
                                          ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-white'}`}
                                    style={{ fontFamily: font.name }}
                                 >
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${fontFamily === font.name ? 'text-slate-400' : 'text-slate-300 group-hover:text-slate-500'}`}>{font.name}</span>
                                    <span className="text-lg font-bold">متجرك الفخم</span>

                                    {fontFamily === font.name && (
                                       <div className="absolute top-2 right-3">
                                          <div className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
                                       </div>
                                    )}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Media View - Compact */}
                  {currentView === 'media' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-right relative">
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                              {[
                                 { label: 'لوجو المتجر', val: logoUrl, set: setLogoUrl, cat: 'logos', tip: 'يظهر في الهيدر والفوتر والفاتورة الخ....', feature: 'hasCustomBranding' },
                                 { label: 'بانر المتجر (الغلاف)', val: bannerUrl, set: setBannerUrl, cat: 'banners', tip: 'يظهر كخلفية، يمكنك ضبط الشفافية من قسم تنسيق المتجر.', feature: 'hasCustomBranding' },
                                 { label: 'صورة الواجهة (Hero Image)', val: heroImageUrl, set: setHeroImageUrl, cat: 'banners', tip: 'تظهر في المتجر، يفضل أن تكون بخلفية شفافة PNG, و اخفاءها في الهاتف.', feature: 'hasHeroImage' },
                                 { label: 'أيقونة المتجر (Favicon)', val: faviconUrl, set: setFaviconUrl, cat: 'favicons', tip: 'تظهر في تبويب المتصفح، يفضل أن تكون مربعة وشفافة.', feature: 'hasCustomBranding' }
                              ].map((item, idx) => {
                                 const isAllowed = config[item.feature as keyof typeof config];
                                 return (
                                    <div key={item.label} className="space-y-4">
                                       <div className="flex items-center justify-between">
                                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                             {item.label}
                                             {!isAllowed && (
                                                <Sparkles className="h-3 w-3 text-amber-500" />
                                             )}
                                          </h4>
                                          {item.val && isAllowed && (
                                             <button
                                                onClick={() => item.set('')}
                                                className="flex items-center gap-2 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
                                             >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                مسح الصورة
                                             </button>
                                          )}
                                       </div>
                                       <p className="text-[10px] font-bold text-slate-400 leading-relaxed -mt-2 mb-3">{item.tip}</p>
                                       <div className="w-full relative group">
                                          {!isAllowed ? (
                                             <div className="relative">
                                                <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200">
                                                   <Zap className="h-5 w-5 text-amber-500 mb-1" />
                                                   <p className="text-[9px] font-black text-slate-500">متاح في الباقات المدفوعة</p>
                                                </div>
                                                <div className="opacity-40 grayscale pointer-events-none">
                                                   <ImageUpload category={item.cat as any} currentUrl={item.val} onUploadSuccess={item.set} />
                                                </div>
                                             </div>
                                          ) : (
                                             <ImageUpload category={item.cat as any} currentUrl={item.val} onUploadSuccess={item.set} />
                                          )}
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Identity View - Compact */}
                  {currentView === 'identity' && (
                     <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-right animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase px-1">اسم المتجر</label>
                              <input value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-black outline-none focus:bg-white focus:border-slate-900 transition-all shadow-sm" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase px-1">واتساب</label>
                              <input value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)} dir="ltr" className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-black outline-none focus:bg-white focus:border-slate-900 text-left shadow-sm" />
                           </div>
                           <div className="md:col-span-2 space-y-2 relative group">
                              <label className="flex items-center justify-between px-1">
                                 <span className="text-[10px] font-black text-slate-400 uppercase">النطاق الخاص (Custom Domain)</span>
                                 {plan !== 'pro' && (
                                    <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded-md uppercase">حصري لـ برو بلس</span>
                                 )}
                              </label>
                              <div className="relative">
                                 <input
                                    value={customDomain}
                                    onChange={e => setCustomDomain(e.target.value)}
                                    disabled={plan !== 'pro'}
                                    placeholder="مثال: www.mystore.com"
                                    dir="ltr"
                                    className={`w-full h-12 bg-slate-50 border rounded-xl pl-11 pr-4 text-sm font-black outline-none transition-all shadow-sm
                                ${plan === 'pro' ? 'border-slate-100 focus:bg-white focus:border-slate-900' : 'border-slate-100 opacity-60 cursor-not-allowed'}
                              `}
                                 />
                                 <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${plan === 'pro' ? 'text-slate-400' : 'text-slate-300'}`} />
                              </div>
                           </div>
                        </div>
                        <div className="pt-8 border-t border-slate-50 space-y-4">
                           <h4 className="text-sm font-black text-slate-900">حسابات التواصل الاجتماعي</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {[
                                 { label: 'فيسبوك', value: facebookUrl, setter: setFacebookUrl, icon: Share2 },
                                 { label: 'انستجرام', value: instagramUrl, setter: setInstagramUrl, icon: Share2 },
                                 { label: 'تيك توك', value: tiktokUrl, setter: setTiktokUrl, icon: Share2 },
                                 { label: 'عنوان المتجر', value: storeAddress, setter: setStoreAddress, icon: MapPin }
                              ].map(social => (
                                 <div key={social.label} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 transition-all hover:bg-white hover:border-slate-200">
                                    <div className="flex items-center gap-2">
                                       {social.icon && <social.icon className="h-3 w-3 text-slate-400" />}
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{social.label}</span>
                                    </div>
                                    <input
                                       value={social.value}
                                       onChange={e => social.setter(e.target.value)}
                                       dir={social.label === 'عنوان المتجر' ? 'rtl' : 'ltr'}
                                       className={`w-full h-10 bg-white border border-slate-100 rounded-lg px-3 text-xs font-bold outline-none focus:border-slate-900 transition-all ${social.label === 'عنوان المتجر' ? 'text-right' : 'text-left'}`}
                                    />
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Checkout View - Compact */}
                  {currentView === 'checkout' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-right">
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
                           <div className="flex flex-row items-center justify-between gap-4 group">
                              <div className="flex items-center gap-3">
                                 <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${codEnabled ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                    <Wallet className="h-5 w-5" />
                                 </div>
                                 <div className="text-right">
                                    <h3 className="text-base font-black text-slate-900">الدفع عند الاستلام (COD)</h3>
                                    <p className="text-[10px] font-bold text-slate-400">تفعيل الدفع نقداً عند استلام المنتج</p>
                                 </div>
                              </div>
                              <button
                                 onClick={() => setCodEnabled(!codEnabled)}
                                 className={`h-7 w-12 rounded-full relative flex items-center transition-all shrink-0 ${codEnabled ? 'bg-slate-900 shadow-lg' : 'bg-slate-200'}`}
                              >
                                 <div className={`h-5 w-5 rounded-full bg-white transition-all ${codEnabled ? 'mr-6' : 'mr-1'}`} />
                              </button>
                           </div>

                           {codEnabled && (
                              <div className="space-y-6 pt-6 border-t border-slate-50 animate-in fade-in duration-500">
                                 <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                       <h4 className="text-sm font-black text-slate-800">طلب عربون مسبق</h4>
                                       <p className="text-[10px] font-bold text-slate-400">لضمان جدية الطلبات وتجنب المرتجعات</p>
                                    </div>
                                    <button
                                       onClick={() => setCodDepositRequired(!codDepositRequired)}
                                       className={`h-6 w-10 rounded-full relative flex items-center transition-all shrink-0 ${codDepositRequired ? 'bg-amber-500' : 'bg-slate-200'}`}
                                    >
                                       <div className={`h-4 w-4 rounded-full bg-white transition-all ${codDepositRequired ? 'mr-5' : 'mr-1'}`} />
                                    </button>
                                 </div>

                                 {codDepositRequired && (
                                    <div className="flex items-center justify-between gap-4 p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                       <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-amber-600 shrink-0">
                                             <Percent className="h-4 w-4" />
                                          </div>
                                          <span className="text-xs font-black text-slate-800">نسبة العربون</span>
                                       </div>
                                       <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 h-10 w-24 shadow-sm focus-within:border-slate-900 transition-all">
                                          <input
                                             type="number"
                                             value={depositPercentage}
                                             onChange={e => setDepositPercentage(Number(e.target.value))}
                                             className="w-full bg-transparent text-sm font-black outline-none text-center font-inter"
                                          />
                                          <span className="text-xs font-black text-slate-300 mr-1">%</span>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>

                        {/* New Payment Details Section */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                 <Landmark className="h-5 w-5" />
                              </div>
                              <div className="text-right">
                                 <h4 className="text-lg font-black text-slate-900">بيانات تحويل الأموال</h4>
                                 <p className="text-[10px] font-bold text-slate-400">ستظهر هذه البيانات في فاتورة العميل</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">عنوان InstaPay</span>
                                 </label>
                                 <div className="relative">
                                    <input
                                       value={invoiceInstapay}
                                       onChange={e => setInvoiceInstapay(e.target.value)}
                                       placeholder="example@instapay"
                                       dir="ltr"
                                       className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 pl-12 text-sm font-black outline-none focus:bg-white focus:border-slate-900 transition-all shadow-sm"
                                    />
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                 </div>
                              </div>

                              <div className="space-y-2">
                                 <label className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">رقم المحفظة الإلكترونية</span>
                                 </label>
                                 <div className="relative">
                                    <input
                                       value={invoiceWallet}
                                       onChange={e => setInvoiceWallet(e.target.value)}
                                       placeholder="01xxxxxxxxx"
                                       dir="ltr"
                                       className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 pl-12 text-sm font-black outline-none focus:bg-white focus:border-slate-900 transition-all shadow-sm"
                                    />
                                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                           <div className="flex items-center gap-3 mb-2">
                              <div className="h-10 w-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                                 <AlignLeft className="h-5 w-5" />
                              </div>
                              <h4 className="text-sm font-black text-slate-900">سياسات المتجر (الاسترجاع، التوصيل، إلخ)</h4>
                           </div>
                           <textarea
                              value={policies}
                              onChange={e => setPolicies(e.target.value)}
                              className="w-full h-48 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none leading-relaxed focus:bg-white focus:border-slate-900 transition-all resize-none"
                              placeholder="اكتب هنا سياسات متجرك بوضوح..."
                           />
                        </div>

                        {/* --- Shipping Settings --- */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                 <Truck className="h-5 w-5" />
                              </div>
                              <div className="text-right">
                                 <h4 className="text-lg font-black text-slate-900">إعدادات الشحن</h4>
                                 <p className="text-[10px] font-bold text-slate-400">حدد أسعار الشحن لمختلف المحافظات</p>
                                 {shippingConfig.type === 'per_governorate' && (
                                    <button 
                                       onClick={() => {
                                          const newGovs: any = {}
                                          GOVERNORATES.forEach(g => newGovs[g] = shippingConfig.flat_rate || 0)
                                          setShippingConfig({ ...shippingConfig, governorates: newGovs })
                                       }}
                                       className="text-[10px] font-black text-emerald-600 hover:underline"
                                    >
                                       تطبيق السعر الموحد على الكل
                                    </button>
                                 )}
                              </div>
                           </div>

                           {/* Pickup Option */}
                           <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-emerald-600">
                                    <Store className="h-4 w-4" />
                                 </div>
                                 <div className="text-right">
                                    <p className="text-xs font-black text-slate-800">تفعيل الاستلام من المكان</p>
                                    <p className="text-[9px] font-bold text-slate-400">السماح للعميل باستلام الطلب بنفسه (شحن مجاني)</p>
                                 </div>
                              </div>
                              <button
                                 onClick={() => setShippingConfig({ ...shippingConfig, allow_pickup: !shippingConfig.allow_pickup })}
                                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${shippingConfig.allow_pickup ? 'bg-emerald-500' : 'bg-slate-200'}`}
                              >
                                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${shippingConfig.allow_pickup ? '-translate-x-6' : '-translate-x-1'}`} />
                              </button>
                           </div>

                           <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                              {[
                                 { id: 'flat', label: 'سعر موحد' },
                                 { id: 'per_governorate', label: 'حسب المحافظة' }
                              ].map(type => (
                                 <button
                                    key={type.id}
                                    onClick={() => handleShippingTypeChange(type.id)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${shippingConfig.type === type.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                 >
                                    {type.label}
                                 </button>
                              ))}
                           </div>

                           {shippingConfig.type === 'flat' ? (
                              <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in duration-300">
                                 <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-900">
                                       <Hash className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-black text-slate-800">سعر الشحن الموحد</span>
                                 </div>
                                 <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 h-10 w-32 shadow-sm">
                                    <input
                                       type="number"
                                       value={shippingConfig.flat_rate}
                                       onChange={e => setShippingConfig({ ...shippingConfig, flat_rate: Number(e.target.value) })}
                                       className="w-full bg-transparent text-sm font-black outline-none text-center font-inter"
                                    />
                                    <span className="text-xs font-black text-slate-300 mr-1">ج.م</span>
                                 </div>
                              </div>
                           ) : (
                              <div className="space-y-4 animate-in fade-in duration-300">
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {GOVERNORATES.map(gov => (
                                       <div key={gov} className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-sky-200 transition-all">
                                          <span className="text-[11px] font-black text-slate-600">{gov}</span>
                                          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 h-8 w-20 shadow-sm focus-within:border-sky-500 transition-all">
                                             <input
                                                type="number"
                                                value={shippingConfig.governorates?.[gov] || 0}
                                                onChange={e => {
                                                   const val = Number(e.target.value)
                                                   setShippingConfig({
                                                      ...shippingConfig,
                                                      governorates: {
                                                         ...shippingConfig.governorates,
                                                         [gov]: val
                                                      }
                                                   })
                                                }}
                                                className="w-full bg-transparent text-[11px] font-black outline-none text-center font-inter"
                                             />
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  )}


                  {/* --- Tracking & Pixels View --- */}
                  {currentView === 'tracking' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                                 <Activity className="h-5 w-5" />
                              </div>
                              <div className="text-right">
                                 <h3 className="text-lg font-black text-slate-900">التتبع والتحليلات</h3>
                                 <p className="text-[10px] font-bold text-slate-400">اربط متجرك بمنصات الإعلانات لتتبع المبيعات</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Meta Pixel */}
                              <div className="space-y-3 text-right">
                                 <div className="flex items-center gap-2 px-1">
                                    <div className="h-6 w-6 bg-[#1877F2] text-white rounded-lg flex items-center justify-center">
                                       <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-800">Meta Pixel ID (Facebook)</h4>
                                 </div>
                                 <input
                                    value={fbPixelId}
                                    onChange={e => setFbPixelId(e.target.value)}
                                    placeholder="مثلاً: 1234567890..."
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-black outline-none focus:bg-white focus:border-[#1877F2] transition-all"
                                 />
                                 <p className="text-[10px] font-bold text-slate-400 px-1">يساعدك في تتبع مبيعات إعلانات فيسبوك وإنستجرام</p>
                              </div>

                              {/* TikTok Pixel */}
                              <div className="space-y-3 text-right">
                                 <div className="flex items-center gap-2 px-1">
                                    <div className="h-6 w-6 bg-black text-white rounded-lg flex items-center justify-center">
                                       <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13-.08-.26-.17-.38-.25v7.39c.02 2.12-.66 4.31-2.22 5.76-1.78 1.68-4.51 2.13-6.79 1.34-2.58-.87-4.45-3.52-4.41-6.24.03-2.31 1.41-4.52 3.53-5.46.7-.31 1.47-.48 2.24-.52.01 1.41-.01 2.83 0 4.24-.54.04-1.1.18-1.55.5-.83.56-1.25 1.62-1.07 2.6.21 1.25 1.45 2.21 2.71 2.01 1.18-.12 2.12-1.17 2.12-2.36V0h.03z"></path></svg>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-800">TikTok Pixel ID</h4>
                                 </div>
                                 <input
                                    value={tiktokPixelId}
                                    onChange={e => setTiktokPixelId(e.target.value)}
                                    placeholder="مثلاً: C6... أو أرقام فقط"
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-black outline-none focus:bg-white focus:border-slate-900 transition-all"
                                 />
                                 <p className="text-[10px] font-bold text-slate-400 px-1">ضروري جداً إذا كنت تعلن على منصة تيك توك</p>
                              </div>

                              {/* Google Analytics */}
                              <div className="space-y-3 text-right">
                                 <div className="flex items-center gap-2 px-1">
                                    <div className="h-6 w-6 bg-[#F9AB00] text-white rounded-lg flex items-center justify-center">
                                       <Activity className="h-3.5 w-3.5" />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-800">Google Analytics ID (G-...)</h4>
                                 </div>
                                 <input
                                    value={googleAnalyticsId}
                                    onChange={e => setGoogleAnalyticsId(e.target.value)}
                                    placeholder="مثلاً: G-XXXXXXXXXX"
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-black outline-none focus:bg-white focus:border-[#F9AB00] transition-all"
                                 />
                                 <p className="text-[10px] font-bold text-slate-400 px-1">لمعرفة عدد زوار المتجر وتفاصيل تحركاتهم</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}


                  {/* --- 7. Subscription Plan (Sleek Grid) --- */}
                  {currentView === 'plan' && (
                     <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 space-y-10">

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           {/* Card 1: Subscription Summary */}
                           <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full -mr-16 -mt-16" />

                              <div className="relative space-y-8">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                       <div className="h-14 w-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-100 shrink-0">
                                          <Zap className="h-7 w-7" fill="currentColor" />
                                       </div>
                                       <div>
                                          <h3 className="text-xl font-black text-slate-900">الاشتراك الحالي</h3>
                                          <p className="text-[10px] font-bold text-slate-400">باقة {getPlanName(currentPlan)} المفعّلة</p>
                                       </div>
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                 </div>

                                 <div className="grid grid-cols-2 gap-4 md:gap-8">
                                    {[
                                       { label: 'تاريخ البدء', val: initialStore?.last_renewed_at ? new Date(initialStore.last_renewed_at).toLocaleDateString('ar-EG') : (initialStore?.created_at ? new Date(initialStore.created_at).toLocaleDateString('ar-EG') : '...'), icon: Calendar },
                                       { label: 'تاريخ الانتهاء', val: initialStore?.plan_expires_at ? new Date(initialStore.plan_expires_at).toLocaleDateString('ar-EG') : 'غير محدود', icon: Clock },
                                       {
                                          label: 'الأيام المتبقية',
                                          val: initialStore?.plan_expires_at
                                             ? `${Math.max(0, Math.ceil((new Date(initialStore.plan_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} يوم`
                                             : 'غير محدود',
                                          isAlert: initialStore?.plan_expires_at && Math.ceil((new Date(initialStore.plan_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 3
                                       },
                                       { label: 'نوع الباقة', val: getPlanName(currentPlan), isPremium: true }
                                    ].map((stat, i) => (
                                       <div key={i} className="space-y-1.5 p-4 bg-slate-50/50 rounded-2xl border border-slate-50 transition-colors group-hover:bg-white group-hover:border-slate-100">
                                          <div className="flex items-center gap-1.5 opacity-40">
                                             {stat.icon && <stat.icon className="h-3 w-3" />}
                                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                          </div>
                                          <p className={`text-sm font-black ${stat.isAlert ? 'text-rose-500 animate-pulse' : stat.isPremium ? 'text-sky-600' : 'text-slate-900'}`}>{stat.val}</p>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           {/* Card 2: Policies & Rules */}
                           <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
                              <div className="absolute top-0 left-0 w-32 h-32 bg-slate-500/5 blur-3xl rounded-full -ml-16 -mt-16" />

                              <div className="relative space-y-6">
                                 <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                       <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                       <h3 className="text-xl font-black text-slate-900">قواعد الاشتراك</h3>
                                       <p className="text-[10px] font-bold text-slate-400">سياسات استمرارية الخدمة</p>
                                    </div>
                                 </div>

                                 <div className="space-y-4">
                                    {[
                                       { title: 'فترة السماح', text: 'بعد انتهاء فترة الاشتراك يتم السماح ب الاحتفاظ بكل البيانات لمدة 3 ايام', icon: Clock },
                                       { title: 'التحويل التلقائي', text: 'اذا مر 3 ايام دون طلب تجديد الاشتراك يتم الرجوع الى خطة المجانية و تطبيقها في كل ما يخص متجرك', icon: Zap },
                                       { title: 'حذف البيانات', text: 'اذا لم يتم تجديد الاشتراك خلال شهر يتم مسح بيانات المتجر نهائيا ما عدا البيانات اللي تسمح لها الخطة المجانيه فقط', icon: Trash2 }
                                    ].map((item, idx) => (
                                       <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-50">
                                          <div className="h-6 w-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                                             {idx + 1}
                                          </div>
                                          <div className="flex flex-col">
                                             <span className="text-[10px] font-black text-slate-800">{item.title}</span>
                                             <span className="text-[9px] font-bold text-slate-400">{item.text}</span>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Plan Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {['starter', 'growth', 'pro'].map(tier => {
                              const planCfg = allPlans?.[tier] || PLAN_CONFIG[tier as PlanTier]
                              const isCurrent = currentPlan === tier
                              const isPro = tier === 'pro'
                              const isGrowth = tier === 'growth'

                              return (
                                 <div
                                    key={tier}
                                    className={`group relative flex flex-col bg-white rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${isCurrent
                                       ? 'border-sky-500 shadow-2xl shadow-sky-100 scale-[1.02] z-10'
                                       : 'border-slate-100 hover:border-sky-200 shadow-sm hover:shadow-xl hover:shadow-slate-100'
                                       }`}
                                 >
                                    {/* Premium Glow for Pro */}
                                    {isPro && (
                                       <div className="absolute -top-24 -right-24 h-48 w-48 bg-sky-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                                    )}

                                    {/* Plan Header */}
                                    <div className={`p-8 pb-6 relative ${isCurrent ? 'bg-sky-50/30' : 'bg-slate-50/30'}`}>
                                       <div className="flex items-center justify-between mb-4">
                                          <div className="space-y-1">
                                             <h4 className="text-xl font-black text-slate-900">{getPlanName(tier as PlanTier)}</h4>
                                             <p className="text-[10px] font-bold text-slate-400">للمتاجر الـ {isPro ? 'العملاقة' : (isGrowth ? 'الناشئة' : 'المبتدئة')}</p>
                                          </div>
                                          {isCurrent && (
                                             <div className="flex items-center gap-1.5 bg-sky-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-sky-100">
                                                <CheckCircle2 className="h-3 w-3" />
                                                خيارك الحالي
                                             </div>
                                          )}
                                       </div>
                                       <div className="flex items-baseline gap-1">
                                          <span className="text-4xl font-black font-inter text-slate-900 tracking-tight">{planCfg.priceMonthly ?? 0}</span>
                                          <span className="text-xs font-black text-slate-400">ج.م <span className="font-bold opacity-50">/ شهر</span></span>
                                       </div>
                                    </div>

                                    {/* Features List */}
                                    <div className="p-8 flex-1 space-y-4 relative">
                                       <div className="space-y-3">
                                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                             <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-900 shrink-0">
                                                <Package className="h-4 w-4" />
                                             </div>
                                             <span className="text-xs font-black text-slate-700">حتى {planCfg.maxProducts} منتج فريد</span>
                                          </div>
                                          {[
                                             { label: `حتى ${planCfg.maxImagesPerProduct} صور لكل منتج`, allowed: true, icon: BannerIcon },
                                             { label: 'إزالة شعار كايا ماركت', allowed: planCfg.canRemoveWatermark, icon: Shield },
                                             { label: planCfg.maxCoupons > 0 ? `حتى ${planCfg.maxCoupons} كوبونات خصم` : 'كوبونات خصم', allowed: planCfg.maxCoupons > 0, icon: Zap },
                                             { label: 'دومين مخصص', allowed: planCfg.hasCustomDomain, icon: Globe },
                                             { label: 'هوية بصرية كاملة', allowed: planCfg.hasCustomBranding, icon: Brush },
                                             { label: 'صورة واجهة احترافية', allowed: planCfg.hasHeroImage, icon: Layout },
                                             { label: 'فواتير PDF', allowed: planCfg.hasPdfInvoice, icon: Landmark },
                                             { label: 'واتساب برو', allowed: planCfg.hasProfessionalWhatsapp, icon: MessageSquare },
                                          ].map((feat, i) => (
                                             <div key={i} className="flex items-center gap-3 px-1">
                                                <div className={`h-5 w-5 rounded-lg flex items-center justify-center shrink-0 ${feat.allowed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-200'}`}>
                                                   {feat.allowed ? <Check className="h-3 w-3" strokeWidth={4} /> : <X className="h-3 w-3" strokeWidth={4} />}
                                                </div>
                                                <span className={`text-[11px] font-bold ${feat.allowed ? 'text-slate-600' : 'text-slate-300 line-through decoration-slate-200'}`}>
                                                   {feat.label}
                                                </span>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-8 pt-0 relative">
                                       {!isCurrent && (
                                          <Link
                                             href={`/checkout/upgrade?plan=${tier}`}
                                             className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl flex items-center justify-center ${isPro
                                                ? 'bg-sky-600 text-white shadow-sky-100 hover:bg-sky-700'
                                                : (isGrowth ? 'bg-slate-900 text-white shadow-slate-100 hover:bg-slate-800' : 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none')
                                                }`}
                                          >
                                             {tier === 'starter' ? 'اختيار الخطة' : 'ترقية المتجر الآن'}
                                          </Link>
                                       )}
                                       {isCurrent && (
                                          <div className="w-full py-4 text-center text-slate-400 bg-slate-50 rounded-2xl font-black text-[10px] border border-slate-100 uppercase tracking-widest">
                                             مفعلة على متجرك
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              )
                           })}
                        </div>
                     </div>
                  )}


               </div>
            </>
         )}


         <UpgradeModal
            isOpen={upgradeModal.isOpen}
            onClose={() => setUpgradeModal(prev => ({ ...prev, isOpen: false }))}
            title="ميزة احترافية"
            description={upgradeModal.description}
            limitName={upgradeModal.name}
         />

         {/* ── Ultra-Compact Floating Actions ────────────────── */}
         {hasChanges && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[50] animate-in slide-in-from-bottom-5 duration-500 w-fit">
               <div className="bg-slate-900/95 backdrop-blur-xl px-2 py-2 rounded-full shadow-2xl flex items-center gap-1 border border-white/10">
                  <button
                     onClick={() => router.refresh()}
                     className="px-6 h-10 rounded-full text-xs font-black text-slate-400 hover:text-white transition-colors"
                  >
                     تجاهل
                  </button>
                  <button
                     onClick={handleSubmit}
                     disabled={loading}
                     className="bg-sky-500 hover:bg-sky-400 text-white px-8 h-10 rounded-full font-black text-xs transition-all shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                     {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                     حفظ التغييرات
                  </button>
               </div>
            </div>
         )}
      </div>
   )
}
