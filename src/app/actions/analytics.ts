'use server'

import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'

export async function getDashboardStats(days: number = 7) {
  const supabase = await createClient()
  const { storeId } = await assertMerchant(supabase)

  // Fetch KPIs
  const { data: kpiData, error: kpiError } = await supabase.rpc('get_store_kpis', { p_store_id: storeId })
  
  // Fetch Daily Sales
  const { data: salesData, error: salesError } = await supabase.rpc('get_store_daily_sales', { 
    p_store_id: storeId, 
    p_days: days 
  })

  // Fetch Top Products
  const { data: topProducts, error: topError } = await supabase.rpc('get_top_products', { 
    p_store_id: storeId,
    p_limit: 5
  })

  if (kpiError) console.error('KPI Fetch Error:', kpiError)
  if (salesError) console.error('Sales Fetch Error:', salesError)
  if (topError) console.error('Top Products Fetch Error:', topError)

  const kpis = kpiData?.[0] || { total_revenue: 0, total_orders: 0, total_views: 0 }
  
  return {
    kpis: {
      revenue: Number(kpis.total_revenue) || 0,
      orders: Number(kpis.total_orders) || 0,
      views: Number(kpis.total_views) || 0,
    },
    salesChart: salesData || [],
    topProducts: topProducts || []
  }
}

export async function incrementStoreViews(storeId: string) {
  const supabase = await createClient()
  // Called safely from the storefront, no auth needed (public).
  // But wait, the function is SECURITY DEFINER so anyone can call it.
  // We can just rely on the rate limiter or simply a lightweight RPC call.
  await supabase.rpc('increment_store_views', { p_store_id: storeId })
}
