import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getDynamicPlanConfigs } from '@/lib/subscription'

export async function GET() {
  const admin = createAdminClient()

  try {
    const { data: stores } = await admin.from('stores').select('id, name, slug, plan, plan_expires_at')
    const { data: products } = await admin.from('products').select('store_id')

    if (!stores) return NextResponse.json({ error: 'No stores found' })

    const result = stores.map(store => {
      const prodsCount = products?.filter(p => p.store_id === store.id).length || 0
      return {
        "اسم المتجر": store.name,
        "رابط المتجر (Slug)": store.slug,
        "الـ ID الخاص به": store.id,
        "عدد المنتجات الفعلي في الداتابيز": prodsCount,
        "الباقة": store.plan,
        "تاريخ الانتهاء": store.plan_expires_at || "غير محدد"
      }
    })

    // Sort by products count descending
    result.sort((a, b) => b["عدد المنتجات الفعلي في الداتابيز"] - a["عدد المنتجات الفعلي في الداتابيز"])

    const plans = await getDynamicPlanConfigs(admin)
    const { data: rawProducts } = await admin.from('products').select('id, name, store_id, image_url, images')

    return NextResponse.json({
      plans,
      rawProducts,
      stores: result
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message })
  }
}
