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
  quantity: number = 1
) {
  // Map single product to items array for the new multi-product function
  const items = [{
    id: product.id,
    quantity: quantity,
    name: product.name,
    price: product.price,
    image_url: product.image_url
  }]
  
  return createOrderMulti(
    items,
    couponCode,
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
    const supabase = await createClient()
    
    // Format items for PostgreSQL JSONB
    const formattedItems = items.map(item => ({
      product_id: item.id || item.product_id,
      quantity: item.quantity,
      name: item.name,
      price: item.price
    }))

    const { data, error } = await supabase.rpc('create_order_multi_v1', {
      p_items: formattedItems,
      p_coupon_code: couponCode,
      p_customer_name: customerName,
      p_customer_address: customerAddress,
      p_customer_phone: customerPhone,
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
