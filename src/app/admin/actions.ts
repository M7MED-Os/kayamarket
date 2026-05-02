'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح لك بالقيام بهذا الإجراء' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
  const imagesRaw = formData.get('images_json') as string
  const images: string[] = imagesRaw ? JSON.parse(imagesRaw) : []
  const image_url = images[0] || null

  const category = formData.get('category') as string || 'أخرى'

  const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : null
  const original_price = formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null
  const sale_end_date = formData.get('sale_end_date') as string || null
  const is_visible = formData.get('is_visible') === 'on'

  const { error } = await supabase.from('products').insert({
    name,
    description: description || null,
    price,
    original_price,
    image_url,
    images,
    category,
    stock,
    sale_end_date,
    is_visible,
  })

  if (error) {
    console.error('Error creating product:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/')
  redirect('/admin/dashboard')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح لك بالقيام بهذا الإجراء' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
  const imagesRaw = formData.get('images_json') as string
  const images: string[] = imagesRaw ? JSON.parse(imagesRaw) : []
  const image_url = images[0] || null

  const category = formData.get('category') as string || 'أخرى'

  const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : null
  const original_price = formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null
  const sale_end_date = formData.get('sale_end_date') as string || null
  const is_visible = formData.get('is_visible') === 'on'

  const { error } = await supabase
    .from('products')
    .update({ 
      name, 
      description: description || null, 
      price, 
      original_price,
      image_url, 
      images, 
      category,
      stock,
      sale_end_date,
      is_visible,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating product:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath(`/products/${id}`)
  revalidatePath('/')
  redirect('/admin/dashboard')
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح لك بالقيام بهذا الإجراء' }
  
  // Get product images
  const { data: product } = await supabase.from('products').select('images, image_url').eq('id', id).single()
  
  if (product) {
    const imagesToDelete: string[] = []
    if (product.images && product.images.length > 0) {
      imagesToDelete.push(...product.images)
    } else if (product.image_url) {
      imagesToDelete.push(product.image_url)
    }
    
    if (imagesToDelete.length > 0) {
      const fileNames = imagesToDelete.map(url => url.split('/').pop()).filter(Boolean) as string[]
      if (fileNames.length > 0) {
        await supabase.storage.from('product-images').remove(fileNames)
      }
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) {
    console.error('Error deleting product:', error)
    return { error: error.message }
  }
  revalidatePath('/admin/dashboard')
  revalidatePath('/')
}

export async function toggleProductVisibility(id: string, is_visible: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح لك بالقيام بهذا الإجراء' }

  const { error } = await supabase
    .from('products')
    .update({ is_visible })
    .eq('id', id)

  if (error) {
    console.error('Error toggling visibility:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/')
}
