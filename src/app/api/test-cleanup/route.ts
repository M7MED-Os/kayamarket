import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const admin = createAdminClient()
    
    // 1. Get Store
    const { data: store, error: storeErr } = await admin.from('stores').select('id, name, plan, plan_expires_at').eq('name', 'Flora').single()
    if (!store) return NextResponse.json({ error: 'Store not found', details: storeErr })

    // 2. Get Starter Plan
    const { data: starterPlan, error: planErr } = await admin.from('subscription_plans').select('*').eq('id', 'starter').single()
    
    // 3. Get Products Count
    const { data: products } = await admin.from('products').select('id').eq('store_id', store.id)

    // 4. Get Branding
    const { data: branding } = await admin.from('store_branding').select('*').eq('store_id', store.id).single()

    return NextResponse.json({
      store: store,
      starterPlan: starterPlan || planErr,
      productsCount: products?.length,
      branding: branding
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
