'use server'

import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function uploadImage(formData: FormData) {
  const supabase = await createClient()

  try {
    const { storeId } = await assertMerchant(supabase)

    const file = formData.get('file') as File
    const category = formData.get('category') as string // 'products', 'logos', 'banners', or 'categories'

    if (!file || !(file instanceof File)) {
      return { success: false, error: 'لم يتم اختيار ملف' }
    }

    if (!['products', 'logos', 'banners', 'categories'].includes(category)) {
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
    const path = `${storeId}/${category}/${fileName}`

    // Upload to 'store-assets' bucket
    const { data, error } = await supabase.storage
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
