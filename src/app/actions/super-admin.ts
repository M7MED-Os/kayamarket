'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { assertSuperAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { PlanTier } from '@/lib/subscription'

/**
 * Update a store's subscription plan (Super Admin Only)
 */
export async function updateStorePlan(storeId: string, plan: PlanTier) {
  const admin = createAdminClient()

  try {
    const supabase = await createClient()
    await assertSuperAdmin(supabase)

    const { error } = await admin
      .from('stores')
      .update({ plan })
      .eq('id', storeId)

    if (error) throw error

    revalidatePath('/super-admin/merchants')
    return { success: true }
  } catch (error: any) {
    console.error('Super Admin Action Error:', error)
    return { success: false, error: error.message || 'حدث خطأ غير متوقع' }
  }
}

/**
 * Delete a store and all its data (Super Admin Only)
 */
export async function deleteStore(storeId: string) {
  const admin = createAdminClient()

  try {
    const supabase = await createClient()
    await assertSuperAdmin(supabase)

    const { error } = await admin.from('stores').delete().eq('id', storeId)
    if (error) throw error

    revalidatePath('/super-admin/merchants')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'فشل حذف المتجر' }
  }
}

/**
 * Update Subscription Plan Configuration (Super Admin Only)
 * Includes maxCoupons (0 = disabled, N = allowed count)
 */
export async function updatePlanConfig(planId: string, updates: any) {
  const admin = createAdminClient()

  try {
    const supabase = await createClient()
    await assertSuperAdmin(supabase)

    const { error } = await admin
      .from('subscription_plans')
      .update({
        max_products: updates.maxProducts,
        max_images_per_product: updates.maxImagesPerProduct,
        max_coupons: updates.maxCoupons ?? 0,
        has_pdf_invoice: updates.hasPdfInvoice,
        has_custom_branding: updates.hasCustomBranding,
        has_custom_domain: updates.hasCustomDomain,
        has_advanced_analytics: updates.hasAdvancedAnalytics,
        can_remove_watermark: updates.canRemoveWatermark,
        has_professional_whatsapp: updates.hasProfessionalWhatsapp,
        price_monthly: updates.priceMonthly,
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)

    if (error) throw error

    revalidatePath('/super-admin/plans')
    return { success: true }
  } catch (error: any) {
    console.error('Update Plan Error:', error)
    return { success: false, error: error.message || 'فشل تحديث إعدادات الباقة' }
  }
}

/**
 * Toggle store active status (Super Admin Only)
 */
export async function toggleStoreStatus(storeId: string, isActive: boolean) {
  const admin = createAdminClient()

  try {
    const supabase = await createClient()
    await assertSuperAdmin(supabase)

    const { error } = await admin
      .from('stores')
      .update({ is_active: isActive })
      .eq('id', storeId)

    if (error) throw error

    revalidatePath('/super-admin/merchants')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'حدث خطأ غير متوقع' }
  }
}
