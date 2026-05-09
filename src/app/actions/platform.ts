'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { assertSuperAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { getDynamicPlanConfigs } from '@/lib/subscription'

/**
 * Get Platform Global Settings
 */
export async function getPlatformSettings() {
  const admin = createAdminClient()
  
  try {
    const { data, error } = await admin
      .from('platform_settings')
      .select('*')
      .single()

    if (error) {
      // If table doesn't exist or is empty, return defaults
      return {
        grace_period_days: 3,
        auto_downgrade_enabled: true
      }
    }

    return data
  } catch (error) {
    return {
      grace_period_days: 3,
      auto_downgrade_enabled: true
    }
  }
}

/**
 * Update Platform Global Settings
 */
export async function updatePlatformSettings(updates: any) {
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('platform_settings')
      .upsert({
        id: 1, // Only one row for settings
        ...updates,
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    revalidatePath('/super-admin/settings')
    return { success: true }
  } catch (error: any) {
    console.error('Update Platform Settings Error:', error)
    return { success: false, error: error.message || 'فشل تحديث إعدادات المنصة' }
  }
}

/**
 * Get Stores Pending Deep Cleanup
 */
export async function getPendingCleanupStores() {
  const admin = createAdminClient()
  try {
    const settings = await getPlatformSettings()
    const graceDays = settings.grace_period_days
    
    const now = new Date()
    const graceLimit = new Date(now)
    graceLimit.setDate(now.getDate() - graceDays)

    const { data: stores } = await admin
      .from('stores')
      .select('id, name, plan, plan_expires_at')
      .not('plan_expires_at', 'is', null)
      .lt('plan_expires_at', graceLimit.toISOString())

    return stores || []
  } catch (error) {
    console.error('Failed to get pending stores:', error)
    return []
  }
}

/**
 * Manual Trigger for Subscription Check & Deep Cleanup
 * Enforces Grace Period and Data Retention Policies.
 */
export async function triggerSubscriptionCheck(specificStoreId?: string) {
  const admin = createAdminClient()

  try {
    const settings = await getPlatformSettings()
    const graceDays = settings.grace_period_days
    
    const now = new Date()
    const graceLimit = new Date(now)
    graceLimit.setDate(now.getDate() - graceDays)

    // 1. Find stores beyond Grace Period (whether already downgraded or not)
    let query = admin
      .from('stores')
      .select('id, plan, plan_expires_at')
      .not('plan_expires_at', 'is', null)
      .lt('plan_expires_at', graceLimit.toISOString())

    if (specificStoreId) {
      query = query.eq('id', specificStoreId)
    }

    const { data: storesToProcess } = await query

    const processedDetails: string[] = []

    if (storesToProcess && storesToProcess.length > 0) {
      for (const store of storesToProcess) {
        let deletedProdsCount = 0
        let brandingStatus = 'لا يوجد'
        let deletedCouponsCount = 0

        // 1. Fetch starter limits using the unified config
        const planConfigs = await getDynamicPlanConfigs(admin)
        const maxProds = planConfigs.starter.maxProducts
        const maxCoupons = planConfigs.starter.maxCoupons
        
        // 1.5 Temporarily elevate store to PRO to bypass Postgres PREMIUM_FEATURE Triggers
        await admin.from('stores').update({ plan: 'pro' }).eq('id', store.id)

        // 2. Cleanup Products & Images FIRST (while still on PRO plan to avoid DB Triggers)
        const { data: products, error: pFetchErr } = await admin.from('products').select('id, image_url, images').eq('store_id', store.id).order('created_at', { ascending: true })

        let productsToKeep: any[] = []

        if (pFetchErr) {
           processedDetails.push(`فشل جلب المنتجات: ${pFetchErr.message}`)
        } else if (products) {
          // A. Delete excess products completely
          if (products.length > maxProds) {
            productsToKeep = products.slice(0, maxProds)
            const productsToDelete = products.slice(maxProds)
            const productIds = productsToDelete.map(p => p.id)

            for (const p of productsToDelete) {
               if (p.image_url) await deleteFromStorage(p.image_url, 'store-assets')
               if (p.images && Array.isArray(p.images)) {
                  for (const img of p.images) await deleteFromStorage(img, 'store-assets')
               }
            }
            const { error: pErr } = await admin.from('products').delete().in('id', productIds)
            if (!pErr) {
               deletedProdsCount = productIds.length
            } else {
               processedDetails.push(`خطأ مسح المنتجات: ${pErr.message}`)
            }
          } else {
            productsToKeep = products
          }

          // B. Enforce image limits on the KEPT products
          const maxImages = planConfigs.starter.maxImagesPerProduct ?? 1
          // Since image_url is the primary image, the extra images array can only hold (maxImages - 1)
          const allowedExtraImages = Math.max(0, maxImages - 1) 
          let deletedExtraImagesCount = 0

          for (const p of productsToKeep) {
             if (p.images && Array.isArray(p.images) && p.images.length > allowedExtraImages) {
                // Determine which images to keep and which to delete
                const imagesToKeep = p.images.slice(0, allowedExtraImages)
                const imagesToDelete = p.images.slice(allowedExtraImages)
                
                for (const img of imagesToDelete) {
                   await deleteFromStorage(img, 'store-assets')
                   deletedExtraImagesCount++
                }

                // Update product in DB to remove extra images from the array
                await admin.from('products').update({ images: imagesToKeep }).eq('id', p.id)
             }
          }
          if (deletedExtraImagesCount > 0) {
             processedDetails.push(`تم مسح ${deletedExtraImagesCount} صور إضافية للمنتجات المتبقية.`)
          }
        }

        // 3. Cleanup Branding Assets (while still on PRO plan)
        const { data: branding } = await admin.from('store_branding').select('*').eq('store_id', store.id).single()
        if (branding) {
           if (branding.logo_url) await deleteFromStorage(branding.logo_url, 'store-assets')
           if (branding.banner_url) await deleteFromStorage(branding.banner_url, 'store-assets')
           if (branding.favicon_url) await deleteFromStorage(branding.favicon_url, 'store-assets')
           if (branding.hero_image_url) await deleteFromStorage(branding.hero_image_url, 'store-assets')

           const { error: bErr } = await admin.from('store_branding').update({
              logo_url: null, banner_url: null, favicon_url: null, hero_image_url: null
           }).eq('store_id', store.id)
           
           if (!bErr) {
             brandingStatus = 'تم المسح'
           } else {
             processedDetails.push(`خطأ تحديث الهوية: ${bErr.message}`)
           }
        } else {
           processedDetails.push(`تنبيه: لا يوجد سجل هوية (store_branding) لهذا المتجر!`)
        }

        // 4. Cleanup Coupons
        const { data: coupons } = await admin.from('coupons').select('id').eq('store_id', store.id).order('created_at', { ascending: true })

        if (coupons && coupons.length > maxCoupons) {
           const couponsToDelete = coupons.slice(maxCoupons)
           const couponIds = couponsToDelete.map(c => c.id)
           const { error: cErr } = await admin.from('coupons').delete().in('id', couponIds)
           if (!cErr) {
             deletedCouponsCount = couponIds.length
           } else {
             processedDetails.push(`خطأ مسح الكوبونات: ${cErr.message}`)
           }
        }

        // 5. FINALLY: Downgrade to Starter and Clear the expiration marker
        await admin.from('stores').update({ plan: 'starter', plan_expires_at: null }).eq('id', store.id)

        processedDetails.push(`تم تنظيف: (هوية: ${brandingStatus} | كوبونات: ${deletedCouponsCount}) -- التشخيص: (الحد: ${maxProds} / منتجات الداتابيز: ${products?.length || 0} / المحذوف: ${deletedProdsCount})`)
      }
    }

    revalidatePath('/', 'layout')
    return { success: true, processed: storesToProcess?.length || 0, details: processedDetails }
  } catch (error: any) {
    console.error('Subscription Check Error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Helper to delete a file from Supabase Storage based on its public URL
 */
async function deleteFromStorage(url: string, bucket: string) {
   if (!url || !url.includes('/storage/v1/object/public/')) return
   
   const admin = createAdminClient()
   try {
      // Extract file path: Everything after the bucket name in the URL
      const parts = url.split(`/${bucket}/`)
      if (parts.length < 2) return
      
      const filePath = parts[1]
      await admin.storage.from(bucket).remove([filePath])
   } catch (error) {
      console.error(`Failed to delete from storage (${bucket}):`, error)
   }
}
