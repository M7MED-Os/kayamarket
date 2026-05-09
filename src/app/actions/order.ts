'use server'

import { createClient } from '@/lib/supabase/server'
import { Product } from '@/types/product'
import { revalidatePath } from 'next/cache'

/**
 * Creates a new order using an atomic DB-side transaction (RPC).
 * This ensures data consistency for coupons and stock in high-concurrency scenarios.
 */
export async function createOrder(
  product: Product,
  couponCode: string,
  customerName: string,
  customerAddress: string,
  customerPhone: string,
  paymentMethod: string,
  storeId?: string,
  idempotencyKey?: string,
  quantity: number = 1,
  variantInfo?: any,
  price?: number
) {
  // Map single product to items array for the new multi-product function
  const items = [{
    id: product.id,
    quantity: quantity,
    name: product.name,
    price: price || product.price,
    image_url: product.image_url,
    variant_info: variantInfo
  }]

  return createOrderMulti(
    items,
    couponCode?.trim() || '',
    customerName,
    customerAddress,
    customerPhone,
    paymentMethod,
    storeId!,
    idempotencyKey
  )
}

export async function createOrderMulti(
  items: any[],
  couponCode: string,
  customerName: string,
  customerAddress: string,
  customerPhone: string,
  paymentMethod: string,
  storeId: string,
  idempotencyKey?: string
) {
  try {
    const { checkRateLimit } = await import('@/lib/utils/rate-limit')
    
    // 🔒 Enforce Rate Limit: 5 orders per minute per IP
    const limitCheck = await checkRateLimit('create_order', 5, 60)
    if (!limitCheck.success) {
      return { success: false, error: limitCheck.error }
    }

    const supabase = await createClient()
    const { sanitizeHtml } = await import('@/lib/utils/sanitize')

    // Format items for PostgreSQL JSONB
    const formattedItems = items.map(item => ({
      product_id: item.id || item.product_id,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      variant_info: item.variant_info || {}
    }))

    const { data, error } = await supabase.rpc('create_order_multi_v2', {
      p_items: formattedItems,
      p_coupon_code: couponCode?.trim() || null,
      p_customer_name: sanitizeHtml(customerName),
      p_customer_address: sanitizeHtml(customerAddress),
      p_customer_phone: sanitizeHtml(customerPhone),
      p_payment_method: paymentMethod,
      p_store_id: storeId,
      p_idempotency_key: idempotencyKey
    })

    if (error) {
      console.error('Order creation error:', error)
      return { success: false, error: error.message }
    }

    const result = data[0]
    if (result.o_error_message) {
      return { success: false, error: result.o_error_message }
    }

    return {
      success: true,
      orderId: result.o_order_id,
      publicToken: result.o_public_token
    }
  } catch (error: any) {
    console.error('Order action exception:', error)
    return { success: false, error: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Updates the status of an existing order.
 */
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  revalidatePath('/')
  return { success: true }
}

/**
 * Deletes an order from the database.
 */
export async function deleteOrder(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('orders').delete().eq('id', orderId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  return { success: true }
}
