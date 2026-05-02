'use server'

import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  const supabase = await createClient()
  try {
    const { storeId } = await assertMerchant(supabase)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .order('name')
    
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createCategory(name: string) {
  const supabase = await createClient()
  try {
    const { storeId } = await assertMerchant(supabase)
    const { error } = await supabase
      .from('categories')
      .insert({ store_id: storeId, name })
    
    if (error) throw error
    revalidatePath('/admin/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateCategory(id: string, name: string) {
  const supabase = await createClient()
  try {
    const { storeId } = await assertMerchant(supabase)
    const { error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .eq('store_id', storeId)
    
    if (error) throw error
    revalidatePath('/admin/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  try {
    const { storeId } = await assertMerchant(supabase)
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('store_id', storeId)
    
    if (error) throw error
    revalidatePath('/admin/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
