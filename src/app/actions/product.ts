'use server'

import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { PlanTier, getPlanConfig, getPlanName, getDynamicPlanConfigs } from '@/lib/subscription'
import { sanitizeHtml, sanitizeObject } from '@/lib/utils/sanitize'

// 🔒 Safe JSON parser — prevents DoS from malformed/oversized payloads
function safeJsonParse(raw: string | null, maxLength = 50000): any {
  if (!raw) return null
  if (raw.length > maxLength) throw new Error('البيانات كبيرة جداً')
  try { return JSON.parse(raw) } catch { throw new Error('بيانات JSON غير صالحة') }
}

const productSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'السعر مطلوب'),
  original_price: z.number().min(0).optional().nullable(),
  stock: z.number().min(0).optional().nullable(),
  category: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  is_visible: z.boolean().default(true),
  sale_end_date: z.string().optional().nullable(),
  variants: z.any().optional().nullable(),
})

// ─── Helper: fetch store plan + dynamic config ───────────────────────────────
async function getStorePlanConfig(supabase: any, storeId: string) {
  const { data: storeData } = await supabase
    .from('stores')
    .select('plan')
    .eq('id', storeId)
    .single()

  const plan = (storeData?.plan || 'starter') as PlanTier
  const dynamicConfigs = await getDynamicPlanConfigs(supabase)
  const config = dynamicConfigs[plan] || getPlanConfig(plan)
  return { plan, config }
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  try {
    const { storeId } = await assertMerchant(supabase)
    const { plan, config } = await getStorePlanConfig(supabase, storeId)

    const rawData = {
      name: sanitizeHtml(formData.get('name') as string),
      description: sanitizeHtml(formData.get('description') as string),
      price: Number(formData.get('price')),
      original_price: formData.get('original_price') ? Number(formData.get('original_price')) : null,
      stock: formData.get('stock') ? Number(formData.get('stock')) : null,
      category: sanitizeHtml(formData.get('category') as string),
      image_url: formData.get('image_url'),
      images: formData.get('images') ? safeJsonParse(formData.get('images') as string) : [],
      is_visible: formData.get('is_visible') === 'true',
      sale_end_date: formData.get('sale_end_date') || null,
      variants: formData.get('variants') ? safeJsonParse(formData.get('variants') as string) : [],
    }

    // 1. Check Total Products Limit
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId)

    if (count !== null && count >= config.maxProducts) {
      return {
        success: false,
        error: `عذراً، لقد وصلت للحد الأقصى للمنتجات (${config.maxProducts}) في خطة ${getPlanName(plan)}. يرجى الترقية لإضافة المزيد.`,
        code: 'LIMIT_REACHED',
        limit: config.maxProducts
      }
    }

    // 2. Check Images Per Product Limit
    const images = rawData.images as string[]
    if (images.length > config.maxImagesPerProduct) {
      return {
        success: false,
        error: `عذراً، خطتك الحالية (${getPlanName(plan)}) تسمح بـ ${config.maxImagesPerProduct} صورة فقط لكل منتج.`,
        code: 'IMAGE_LIMIT_REACHED',
        limit: config.maxImagesPerProduct
      }
    }

    const parsed = productSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'بيانات غير صالحة' }
    }

    // 3. Ensure Category exists
    const categoryName = parsed.data.category || 'الكل'
    if (categoryName !== 'الكل') {
      await supabase
        .from('categories')
        .upsert({ store_id: storeId, name: categoryName }, { onConflict: 'store_id, name' })
    }

    const { error } = await supabase
      .from('products')
      .insert({
        store_id: storeId,
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        original_price: parsed.data.original_price,
        stock: parsed.data.stock,
        category: categoryName,
        image_url: parsed.data.image_url,
        images: rawData.images as string[],
        is_visible: parsed.data.is_visible,
        sale_end_date: parsed.data.sale_end_date,
        variants: parsed.data.variants,
      })

    if (error) {
      // Surface DB trigger errors nicely
      if (error.message?.includes('LIMIT_REACHED')) {
        return { success: false, error: `لقد وصلت للحد الأقصى للمنتجات (${config.maxProducts}) في خطتك الحالية.`, code: 'LIMIT_REACHED' }
      }
      console.error('Database Error:', error)
      return { success: false, error: 'حدث خطأ في قاعدة البيانات: ' + error.message }
    }

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unauthorized' }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()

  try {
    const { storeId } = await assertMerchant(supabase)
    const { plan, config } = await getStorePlanConfig(supabase, storeId)

    const rawData = {
      name: sanitizeHtml(formData.get('name') as string),
      description: sanitizeHtml(formData.get('description') as string),
      price: Number(formData.get('price')),
      original_price: formData.get('original_price') ? Number(formData.get('original_price')) : null,
      stock: formData.get('stock') ? Number(formData.get('stock')) : null,
      category: sanitizeHtml(formData.get('category') as string),
      image_url: formData.get('image_url'),
      images: formData.get('images') ? safeJsonParse(formData.get('images') as string) : [],
      is_visible: formData.get('is_visible') === 'true',
      sale_end_date: formData.get('sale_end_date') || null,
      variants: formData.get('variants') ? safeJsonParse(formData.get('variants') as string) : [],
    }

    // ✅ Check Images Per Product Limit (now also on update)
    const images = rawData.images as string[]
    if (images.length > config.maxImagesPerProduct) {
      return {
        success: false,
        error: `عذراً، خطتك الحالية (${getPlanName(plan)}) تسمح بـ ${config.maxImagesPerProduct} صورة فقط لكل منتج.`,
        code: 'IMAGE_LIMIT_REACHED',
        limit: config.maxImagesPerProduct
      }
    }

    const parsed = productSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'بيانات غير صالحة' }
    }

    // Ensure Category exists
    const categoryName = parsed.data.category || 'الكل'
    if (categoryName !== 'الكل') {
      await supabase
        .from('categories')
        .upsert({ store_id: storeId, name: categoryName }, { onConflict: 'store_id, name' })
    }

    const { error } = await supabase
      .from('products')
      .update({
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        original_price: parsed.data.original_price,
        stock: parsed.data.stock,
        category: categoryName,
        image_url: parsed.data.image_url,
        images: rawData.images as string[],
        is_visible: parsed.data.is_visible,
        sale_end_date: parsed.data.sale_end_date,
        variants: parsed.data.variants,
      })
      .eq('id', id)
      .eq('store_id', storeId)

    if (error) {
      if (error.message?.includes('LIMIT_REACHED')) {
        return { success: false, error: `عدد الصور يتجاوز الحد المسموح (${config.maxImagesPerProduct}) في خطتك الحالية.`, code: 'IMAGE_LIMIT_REACHED' }
      }
      console.error('Database Update Error:', error)
      return { success: false, error: 'حدث خطأ أثناء التحديث: ' + error.message }
    }

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unauthorized' }
  }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  try {
    const { storeId } = await assertMerchant(supabase)

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('store_id', storeId)

    if (error) {
      console.error('Database Delete Error:', error)
      return { success: false, error: 'حدث خطأ أثناء الحذف' }
    }

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unauthorized' }
  }
}
