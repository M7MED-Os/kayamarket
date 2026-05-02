'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function submitUpgradeRequest(formData: FormData) {
  const supabase = await createClient()
  
  try {
    const { storeId, userId } = await assertMerchant(supabase)

    const planId = formData.get('plan_id') as string
    const senderPhone = formData.get('sender_phone') as string
    const receiptUrl = formData.get('receipt_url') as string

    if (!planId || !senderPhone || !receiptUrl) {
      return { success: false, error: 'يرجى إكمال جميع البيانات المطلوبة' }
    }

    // Using Admin Client to bypass RLS since assertMerchant already verified access
    const admin = createAdminClient()
    const { error } = await admin
      .from('plan_upgrade_requests')
      .insert({
        store_id: storeId,
        user_id: userId,
        plan_id: planId,
        sender_phone: senderPhone,
        receipt_url: receiptUrl,
        status: 'pending'
      })

    if (error) {
      console.error('Upgrade Request Error:', error)
      return { success: false, error: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى' }
    }

    revalidatePath('/admin/settings')
    
    return { success: true }
  } catch (error: any) {
    console.error('Submit Upgrade Error:', error)
    return { success: false, error: error.message || 'حدث خطأ غير متوقع' }
  }
}

export async function approveUpgradeRequest(requestId: string, days: number = 30) {
  const admin = createAdminClient()
  
  try {
    const { data: request, error: fetchError } = await admin
      .from('plan_upgrade_requests')
      .select('store_id, plan_id')
      .eq('id', requestId)
      .single()

    if (fetchError || !request) throw new Error('الطلب غير موجود')

    // Calculate expiry date
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)

    // 1. Update store plan and expiry (Using Admin Client to bypass RLS)
    const { error: storeError } = await admin
      .from('stores')
      .update({ 
        plan: request.plan_id,
        plan_expires_at: expiryDate.toISOString()
      })
      .eq('id', request.store_id)

    if (storeError) {
      console.error('Store Update Error:', storeError)
      throw new Error('فشل تحديث خطة المتجر')
    }

    // 2. Mark request as approved
    const { error: requestError } = await admin
      .from('plan_upgrade_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)

    if (requestError) throw new Error('فشل تحديث حالة الطلب')

    revalidatePath('/super-admin/upgrade-requests')
    revalidatePath('/admin/settings')
    
    return { success: true }
  } catch (error: any) {
    console.error('Approval Error:', error)
    return { success: false, error: error.message }
  }
}

export async function rejectUpgradeRequest(requestId: string, notes: string) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('plan_upgrade_requests')
      .update({ status: 'rejected', admin_notes: notes })
      .eq('id', requestId)

    if (error) throw new Error('فشل تحديث حالة الطلب')

    revalidatePath('/super-admin/upgrade-requests')
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
