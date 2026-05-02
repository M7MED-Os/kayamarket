'use server'

import { createClient } from '@/lib/supabase/server'

export async function fetchOrderForTracking(storeId: string, shortId: string, phone: string) {
  try {
    const supabase = await createClient()

    // Find by phone and store
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('store_id', storeId)
      .eq('customer_phone', phone.trim())

    if (error || !orders || orders.length === 0) {
      return { success: false, error: 'لم يتم العثور على طلب مطابق لهذه البيانات.' }
    }

    const cleanShortId = shortId.trim().toLowerCase().replace('#', '')
    
    // Find the specific order by short ID
    const order = orders.find((o: any) => o.id.split('-')[0].toLowerCase() === cleanShortId || o.id.toLowerCase() === cleanShortId)

    if (!order) {
      return { success: false, error: 'لم يتم العثور على طلب مطابق لهذه البيانات.' }
    }

    return { success: true, order }
  } catch (err) {
    console.error('Track order error:', err)
    return { success: false, error: 'حدث خطأ غير متوقع.' }
  }
}
