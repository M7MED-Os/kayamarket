'use server'

import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { revalidatePath, revalidateTag } from 'next/cache'
import { PlanTier, getPlanConfig, getDynamicPlanConfigs } from '@/lib/subscription'

export async function updateStoreSettings(formData: FormData) {
  const supabase = await createClient()

  try {
    const { storeId } = await assertMerchant(supabase)

    // 1. Branding Data
    const storeName = formData.get('store_name') as string
    const whatsappPhone = formData.get('whatsapp_phone') as string
    const primaryColor = formData.get('primary_color') as string
    const logoUrl = formData.get('logo_url') as string
    const bannerUrl = formData.get('banner_url') as string
    const faviconUrl = formData.get('favicon_url') as string
    const tagline = formData.get('tagline') as string
    const footerText = formData.get('footer_text') as string
    const invoiceInstapay = formData.get('invoice_instapay') as string
    const invoiceWallet = formData.get('invoice_wallet') as string
    const customDomain = formData.get('custom_domain') as string

    // Builder Fields
    const showHero = formData.get('show_hero') === 'true'
    const heroTitle = formData.get('hero_title') as string
    const heroDescription = formData.get('hero_description') as string
    const announcementText = formData.get('announcement_text') as string
    const announcementEnabled = formData.get('announcement_enabled') === 'true'
    const facebookUrl = formData.get('facebook_url') as string
    const instagramUrl = formData.get('instagram_url') as string
    const tiktokUrl = formData.get('tiktok_url') as string
    const address = formData.get('address') as string
    const showHeroMobile = formData.get('show_hero_mobile') === 'true'

    // Advanced Builder Fields
    const secondaryColor = formData.get('secondary_color') as string
    const fontFamily = formData.get('font_family') as string
    const sectionsRaw = formData.get('sections') as string
    const headerSettingsRaw = formData.get('header_settings') as string
    const footerSettingsRaw = formData.get('footer_settings') as string

    const sections = sectionsRaw ? JSON.parse(sectionsRaw) : null
    const headerSettings = headerSettingsRaw ? JSON.parse(headerSettingsRaw) : null
    const footerSettings = footerSettingsRaw ? JSON.parse(footerSettingsRaw) : null

    // New Premium Fields
    const heroAlignment = formData.get('hero_alignment') as string
    const heroImageUrl = formData.get('hero_image_url') as string
    const heroCtaText = formData.get('hero_cta_text') as string
    const bannerOverlayOpacity = parseInt(formData.get('banner_overlay_opacity') as string) || 50
    const featuresDataRaw = formData.get('features_data') as string
    const footerDescription = formData.get('footer_description') as string

    const featuresData = featuresDataRaw ? JSON.parse(featuresDataRaw) : null

    // 2. General Settings Data
    const codEnabled = formData.get('cod_enabled') === 'true'
    const codDepositRequired = formData.get('cod_deposit_required') === 'true'
    const depositPercentage = parseInt(formData.get('deposit_percentage') as string) || 0
    const policies = formData.get('policies') as string

    // --- Update Store Data (Name & Phone & Domain) ---
    const { data: store } = await supabase.from('stores').select('plan, slug').eq('id', storeId).single()
    const plan = (store?.plan || 'starter') as PlanTier
    const storeSlug = store?.slug || ''
    const dynamicConfigs = await getDynamicPlanConfigs(supabase)
    const config = dynamicConfigs[plan] || getPlanConfig(plan)

    const storeUpdateData: any = {
      name: storeName,
      whatsapp_phone: whatsappPhone
    }

    // Domain Enforcement
    if (config.hasCustomDomain) {
      storeUpdateData.custom_domain = customDomain || null
    }

    const { error: storeUpdateError } = await supabase
      .from('stores')
      .update(storeUpdateData)
      .eq('id', storeId)

    if (storeUpdateError) throw new Error('فشل حفظ بيانات المتجر: ' + storeUpdateError.message)

    // --- Execute Branding Upsert ---
    const { data: currentBranding } = await supabase.from('store_branding').select('primary_color, font_family, logo_url, banner_url').eq('store_id', storeId).single()

    const brandingData: any = {
      store_id: storeId,
      logo_url: logoUrl || null,
      banner_url: bannerUrl || null,
      favicon_url: faviconUrl || null,
      tagline: tagline || null,
      footer_text: footerText || null,
      invoice_instapay: invoiceInstapay || null,
      invoice_wallet: invoiceWallet || null,
      show_hero: showHero,
      hero_title: heroTitle || null,
      hero_description: heroDescription || null,
      announcement_text: announcementText || null,
      announcement_enabled: announcementEnabled,
      facebook_url: facebookUrl || null,
      instagram_url: instagramUrl || null,
      tiktok_url: tiktokUrl || null,
      address: address || null,
      sections: sections,
      header_settings: headerSettings,
      footer_settings: footerSettings,
      hero_alignment: heroAlignment || 'right',
      hero_image_url: heroImageUrl || null,
      hero_cta_text: heroCtaText || 'تسوق الآن',
      banner_overlay_opacity: bannerOverlayOpacity,
      features_data: featuresData,
      footer_description: footerDescription || null,
      show_hero_mobile: showHeroMobile,
      faq_data: formData.get('faq_data') ? JSON.parse(formData.get('faq_data') as string) : null,
      selected_theme: formData.get('selected_theme') as string || 'default',
      updated_at: new Date().toISOString()
    }

    // --- Branding Restrictions ---
    // Fetch current branding to compare for changes
    const { data: currentBrandingDb } = await supabase
      .from('store_branding')
      .select('logo_url, banner_url, favicon_url, hero_image_url')
      .eq('store_id', storeId)
      .single()

    // 1. General Branding (Logo, Banner, Favicon)
    const brandingChanged = 
      (logoUrl && logoUrl !== currentBrandingDb?.logo_url) || 
      (bannerUrl && bannerUrl !== currentBrandingDb?.banner_url) ||
      (faviconUrl && faviconUrl !== currentBrandingDb?.favicon_url);

    if (brandingChanged && !config.hasCustomBranding) {
      return {
        success: false,
        error: 'عذراً، رفع الشعار والبانر والأيقونة متاح فقط في الباقات المدفوعة.',
        code: 'BRANDING_LOCKED'
      }
    }

    // 2. Hero Image specifically
    const heroImageChanged = (heroImageUrl && heroImageUrl !== currentBrandingDb?.hero_image_url);
    if (heroImageChanged && !config.hasHeroImage) {
      return {
        success: false,
        error: 'عذراً، ميزة صورة الواجهة (Hero Image) تتطلب باقة أعلى.',
        code: 'HERO_IMAGE_LOCKED'
      }
    }

    // --- Domain Restrictions ---
    if (!config.hasCustomDomain && customDomain) {
      return {
        success: false,
        error: 'عذراً، ربط الدومين المخصص متاح فقط في باقة Pro Plus.',
        code: 'DOMAIN_LOCKED'
      }
    }

    // Branding Enforcement
    brandingData.primary_color = primaryColor || currentBranding?.primary_color || '#0ea5e9'
    brandingData.secondary_color = secondaryColor || null
    brandingData.font_family = fontFamily || currentBranding?.font_family || 'Cairo'

    const { error: brandingError } = await supabase
      .from('store_branding')
      .upsert(brandingData, { onConflict: 'store_id' })

    if (brandingError) throw new Error('فشل حفظ الهوية البصرية: ' + brandingError.message)

    // --- Execute General Settings Upsert ---
    const { error: settingsError } = await supabase
      .from('store_settings')
      .upsert({
        store_id: storeId,
        cod_enabled: codEnabled,
        cod_deposit_required: codDepositRequired,
        deposit_percentage: depositPercentage,
        policies: policies || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'store_id' })

    if (settingsError) throw new Error('فشل حفظ السياسات: ' + settingsError.message)

    // Success: Revalidate — bust all caches so theme shows immediately
    revalidatePath('/admin/settings')
    if (storeSlug) {
      revalidatePath(`/store/${storeSlug}`, 'layout')
      revalidatePath('/', 'layout') // Global refresh for store settings
    }

    return { success: true }
  } catch (error: any) {
    console.error('Settings Update Error:', error)
    return { success: false, error: error.message || 'حدث خطأ غير متوقع' }
  }
}
