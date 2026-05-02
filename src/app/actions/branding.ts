'use server'

import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { revalidatePath, revalidateTag } from 'next/cache'
import { PlanTier, getDynamicPlanConfigs, getPlanConfig, getPlanName } from '@/lib/subscription'

export async function updateStoreBranding(formData: FormData) {
  const supabase = await createClient()

  try {
    const { storeId } = await assertMerchant(supabase)

    // ✅ Fetch plan config
    const { data: storeData } = await supabase
      .from('stores').select('plan').eq('id', storeId).single()
    const plan = (storeData?.plan || 'starter') as PlanTier
    const dynamicConfigs = await getDynamicPlanConfigs(supabase)
    const config = dynamicConfigs[plan] || getPlanConfig(plan)

    const primaryColor = formData.get('primary_color') as string
    const logoUrl = formData.get('logo_url') as string | null
    const tagline = formData.get('tagline') as string | null
    const footerText = formData.get('footer_text') as string | null

    if (!primaryColor) {
      return { success: false, error: 'اللون الرئيسي مطلوب' }
    }

    // ✅ Plan check: logo and banner require hasCustomBranding
    if (!config.hasCustomBranding && logoUrl) {
      return {
        success: false,
        error: `رفع الشعار متاح فقط في الباقات المدفوعة. خطتك الحالية: ${getPlanName(plan)}.`,
        code: 'PLAN_LIMIT'
      }
    }

    const { error } = await supabase
      .from('store_branding')
      .upsert({
        store_id: storeId,
        primary_color: primaryColor,
        // Only save logo if plan allows it
        logo_url: config.hasCustomBranding ? (logoUrl || null) : null,
        tagline: tagline || null,
        footer_text: footerText || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'store_id' })

    if (error) {
      console.error('Update branding error:', error)
      // Surface DB trigger errors
      if (error.message?.includes('PREMIUM_FEATURE')) {
        return { success: false, error: 'الشعار والبانر متاحان فقط في الباقات المدفوعة.', code: 'PLAN_LIMIT' }
      }
      return { success: false, error: 'حدث خطأ أثناء حفظ الإعدادات' }
    }

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unauthorized' }
  }
}
