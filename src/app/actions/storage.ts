'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { assertMerchant, assertSuperAdmin } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function uploadImage(formData: FormData) {
  const supabase = await createClient()

  try {
    let uploaderId = ''
    
    // Check if it's a merchant first
    try {
      const { storeId } = await assertMerchant(supabase)
      uploaderId = storeId
    } catch (err) {
      // If not a merchant, check if it's a super admin
      const { role } = await assertSuperAdmin(supabase)
      if (role === 'super_admin') {
        uploaderId = 'platform'
      } else {
        throw new Error('NO_ACCESS')
      }
    }

    const file = formData.get('file') as File
    const category = formData.get('category') as string // 'products', 'logos', 'banners', or 'categories'

    if (!file || !(file instanceof File)) {
      return { success: false, error: 'لم يتم اختيار ملف' }
    }

    const validCategories = ['products', 'logos', 'banners', 'categories', 'themes']
    if (!validCategories.includes(category)) {
      return { success: false, error: 'الفئة غير صالحة' }
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: 'حجم الصورة يجب ألا يتجاوز 2 ميجابايت' }
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'يجب أن يكون الملف صورة' }
    }

    const fileExtension = file.name.split('.').pop()
    const fileName = `${randomUUID()}.${fileExtension}`
    const path = `${uploaderId}/${category}/${fileName}`

    // Upload to 'store-assets' bucket
    // If uploaderId is 'platform', we use the Admin Client to bypass merchant-only RLS policies
    const storageClient = uploaderId === 'platform' ? createAdminClient().storage : supabase.storage

    const { data, error } = await storageClient
      .from('store-assets')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload Error:', error)
      return { success: false, error: 'حدث خطأ أثناء رفع الصورة' }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('store-assets')
      .getPublicUrl(path)

    return { success: true, url: publicUrlData.publicUrl }

  } catch (error: any) {
    return { success: false, error: error.message || 'Unauthorized' }
  }
}
