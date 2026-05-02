'use server'

import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { PlanTier, getDynamicPlanConfigs, getPlanConfig, getPlanName } from '@/lib/subscription'

// ─── Helper: fetch store plan features ──────────────────────────────────────
async function getStorePlanFeatures(supabase: any, storeId: string) {
  const { data: storeData } = await supabase
    .from('stores').select('plan').eq('id', storeId).single()
  const plan = (storeData?.plan || 'starter') as PlanTier
  const dynamicConfigs = await getDynamicPlanConfigs(supabase)
  return { plan, config: dynamicConfigs[plan] || getPlanConfig(plan) }
}

export async function createCoupon(formData: FormData) {
  const supabase = await createClient()
  const { storeId } = await assertMerchant(supabase)

  // ✅ Plan check: coupons feature gate
  const { plan, config } = await getStorePlanFeatures(supabase, storeId)
  if (config.maxCoupons === 0) {
    return {
      error: `نظام الكوبونات غير متاح في خطة ${getPlanName(plan)}. يرجى الترقية إلى خطة برو أو أعلى.`,
      code: 'PLAN_LIMIT'
    }
  }

  // ✅ Count check: max coupons per plan
  const { count: currentCount } = await supabase
    .from('coupons')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)

  if (currentCount !== null && currentCount >= config.maxCoupons) {
    return {
      error: `لقد وصلت للحد الأقصى للكوبونات (${config.maxCoupons}) في خطة ${getPlanName(plan)}. يرجى الترقية لإضافة المزيد.`,
      code: 'LIMIT_REACHED',
      limit: config.maxCoupons
    }
  }

  const code = (formData.get('code') as string).toUpperCase()
  const discount_percentage = parseInt(formData.get('discount_percentage') as string)
  const max_uses = formData.get('max_uses') ? parseInt(formData.get('max_uses') as string) : null
  const expires_at = formData.get('expires_at') ? new Date(formData.get('expires_at') as string).toISOString() : null
  const is_active = formData.get('is_active') === 'true' || formData.get('is_active') === 'on'

  if (!code) return { error: 'كود الكوبون مطلوب' }
  if (!discount_percentage || discount_percentage < 1 || discount_percentage > 100) {
    return { error: 'نسبة الخصم يجب أن تكون بين 1 و 100' }
  }
  if (max_uses !== null && max_uses <= 0) {
    return { error: 'عدد الاستخدامات يجب أن يكون أكبر من 0' }
  }
  if (expires_at && new Date(expires_at) < new Date()) {
    return { error: 'تاريخ الانتهاء يجب أن يكون في المستقبل' }
  }

  const { data, error } = await supabase
    .from('coupons')
    .insert({
      store_id: storeId,
      code,
      discount_percentage,
      max_uses,
      expires_at,
      is_active,
      current_uses: 0
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error creating coupon:', error)
    if (error.code === '23505') return { error: 'هذا الكود مستخدم بالفعل' }
    // Surface DB trigger errors
    if (error.message?.includes('PLAN_LIMIT')) return { error: 'الكوبونات غير متاحة في خطتك الحالية.', code: 'PLAN_LIMIT' }
    if (error.message?.includes('LIMIT_REACHED')) return { error: `لقد وصلت للحد الأقصى للكوبونات (${config.maxCoupons}).`, code: 'LIMIT_REACHED' }
    return { error: error.message }
  }

  revalidatePath('/admin/coupons')
  return { success: true, coupon: data }
}

export async function updateCoupon(id: string, formData: FormData) {
  const supabase = await createClient()
  const { storeId } = await assertMerchant(supabase)

  const { data: existing } = await supabase
    .from('coupons').select('id').eq('id', id).eq('store_id', storeId).single()
  if (!existing) return { error: 'الكوبون غير موجود أو لا تملك صلاحية تعديله' }

  const code = (formData.get('code') as string).toUpperCase()
  const discount_percentage = parseInt(formData.get('discount_percentage') as string)
  const max_uses = formData.get('max_uses') ? parseInt(formData.get('max_uses') as string) : null
  const expires_at = formData.get('expires_at') ? new Date(formData.get('expires_at') as string).toISOString() : null
  const is_active = formData.get('is_active') === 'true' || formData.get('is_active') === 'on'

  if (!code) return { error: 'كود الكوبون مطلوب' }
  if (!discount_percentage || discount_percentage < 1 || discount_percentage > 100) {
    return { error: 'نسبة الخصم يجب أن تكون بين 1 و 100' }
  }
  if (max_uses !== null && max_uses <= 0) return { error: 'عدد الاستخدامات يجب أن يكون أكبر من 0' }
  if (expires_at && new Date(expires_at) < new Date()) return { error: 'تاريخ الانتهاء يجب أن يكون في المستقبل' }

  const { data, error } = await supabase
    .from('coupons')
    .update({ code, discount_percentage, max_uses, expires_at, is_active })
    .eq('id', id).eq('store_id', storeId)
    .select('*').single()

  if (error) {
    if (error.code === '23505') return { error: 'هذا الكود مستخدم بالفعل' }
    return { error: error.message }
  }

  revalidatePath('/admin/coupons')
  return { success: true, coupon: data }
}

export async function deleteCoupon(id: string) {
  const supabase = await createClient()
  const { storeId } = await assertMerchant(supabase)

  const { data: existing } = await supabase
    .from('coupons').select('id').eq('id', id).eq('store_id', storeId).single()
  if (!existing) return { error: 'الكوبون غير موجود أو لا تملك صلاحية حذفه' }

  const { error } = await supabase.from('coupons').delete().eq('id', id).eq('store_id', storeId)
  if (error) return { error: error.message }

  revalidatePath('/admin/coupons')
  return { success: true }
}

export async function toggleCoupon(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { storeId } = await assertMerchant(supabase)

  const { data: existing } = await supabase
    .from('coupons').select('id').eq('id', id).eq('store_id', storeId).single()
  if (!existing) return { error: 'الكوبون غير موجود أو لا تملك صلاحية تعديله' }

  const { error } = await supabase
    .from('coupons').update({ is_active: !currentStatus }).eq('id', id).eq('store_id', storeId)
  if (error) return { error: error.message }

  revalidatePath('/admin/coupons')
  return { success: true }
}

export async function validateCoupon(code: string, storeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('coupons')
    .select('discount_percentage, max_uses, current_uses, expires_at, is_active')
    .eq('code', code.toUpperCase())
    .eq('store_id', storeId)
    .eq('is_active', true)
    .single()

  if (error || !data) return { error: 'كود الخصم غير صحيح أو غير مفعل' }
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { error: 'كود الخصم منتهي الصلاحية' }
  if (data.max_uses !== null && data.current_uses >= data.max_uses) return { error: 'تم استهلاك عدد مرات استخدام هذا الكود' }

  return { success: true, discount: data.discount_percentage }
}
