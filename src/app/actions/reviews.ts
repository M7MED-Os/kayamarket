'use server'

import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function submitProductReview(
  storeId: string,
  productId: string | null,
  customerName: string,
  rating: number,
  comment: string
) {
  try {
    const supabase = await createClient()

    if (!customerName.trim() || rating < 1 || rating > 5) {
      return { success: false, error: 'بيانات التقييم غير صحيحة' }
    }

    const { error } = await supabase
      .from('product_reviews')
      .insert({
        store_id: storeId,
        product_id: productId,
        customer_name: customerName.trim(),
        rating,
        comment: comment.trim() || null,
        status: 'pending'
      })

    if (error) {
      console.error('Error submitting review:', error)
      return { success: false, error: 'حدث خطأ أثناء إرسال التقييم' }
    }

    return { success: true }
  } catch (err) {
    console.error('Review submission exception:', err)
    return { success: false, error: 'حدث خطأ غير متوقع' }
  }
}

export async function submitStoreReview(
  storeId: string,
  customerName: string,
  rating: number,
  comment: string
) {
  return submitProductReview(storeId, null, customerName, rating, comment)
}

export async function getApprovedReviews(productId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('product_reviews')
    .select('id, customer_name, rating, comment, created_at')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data
}

export async function getProductRatingSummary(productId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_product_rating', { p_product_id: productId })

  if (error || !data || data.length === 0) {
    return { average_rating: 0, total_reviews: 0 }
  }

  return {
    average_rating: Number(data[0].average_rating),
    total_reviews: Number(data[0].total_reviews)
  }
}

// ── Merchant Actions ─────────────────────────────────────────────────────────

export async function getAllStoreReviews() {
  const supabase = await createClient()
  // 🔒 Auth Guard: derive storeId from session, not from client parameter
  const { storeId } = await assertMerchant(supabase)
  
  const { data, error } = await supabase
    .from('product_reviews')
    .select(`
      id, customer_name, rating, comment, status, created_at, product_id,
      products ( id, name, image_url )
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data
}

export async function getPendingReviews() {
  const supabase = await createClient()
  // 🔒 Auth Guard: derive storeId from session, not from client parameter
  const { storeId } = await assertMerchant(supabase)
  
  const { data, error } = await supabase
    .from('product_reviews')
    .select(`
      id, customer_name, rating, comment, status, created_at, product_id,
      products ( id, name, image_url )
    `)
    .eq('store_id', storeId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending reviews:', error)
    return []
  }

  return data
}

export async function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected') {
  try {
    const supabase = await createClient()
    
    // Auth check happens automatically via RLS based on the user's store_id roles
    
    const { data: review, error: fetchError } = await supabase
      .from('product_reviews')
      .select('product_id, store_id, products(store_id)')
      .eq('id', reviewId)
      .single()
      
    if (fetchError || !review) {
      return { success: false, error: 'التقييم غير موجود' }
    }

    if (status === 'rejected') {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId)

      if (error) {
        console.error('Error deleting review:', error)
        return { success: false, error: 'فشل حذف التقييم' }
      }
    } else {
      const { error } = await supabase
        .from('product_reviews')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', reviewId)

      if (error) {
        console.error('Error updating review status:', error)
        return { success: false, error: 'فشل تحديث حالة التقييم' }
      }
    }

    // Revalidate paths to update the UI
    const storeId = review.store_id || (review.products as any)?.store_id
    revalidatePath(`/admin/reviews`)
    revalidatePath(`/store/[slug]/products/${review.product_id}`, 'page')

    return { success: true }
  } catch (err) {
    console.error('Update review exception:', err)
    return { success: false, error: 'حدث خطأ غير متوقع' }
  }
}

export async function bulkUpdateReviewStatus(reviewIds: string[], status: 'approved' | 'rejected') {
  try {
    const supabase = await createClient()
    
    if (status === 'rejected') {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .in('id', reviewIds)

      if (error) {
        console.error('Error bulk deleting reviews:', error)
        return { success: false, error: 'فشل حذف التقييمات' }
      }
    } else {
      const { error } = await supabase
        .from('product_reviews')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', reviewIds)

      if (error) {
        console.error('Error bulk updating review status:', error)
        return { success: false, error: 'فشل تحديث حالة التقييمات' }
      }
    }

    revalidatePath(`/admin/reviews`)
    return { success: true }
  } catch (err) {
    console.error('Bulk update review exception:', err)
    return { success: false, error: 'حدث خطأ غير متوقع' }
  }
}

