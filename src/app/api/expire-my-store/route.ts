import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const admin = createAdminClient()

  try {
    // 1. Get the currently logged-in user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'لم تقم بتسجيل الدخول كتاجر' })

    // 2. Get their REAL store ID
    const { data: role } = await supabase.from('user_roles').select('store_id').eq('user_id', user.id).single()
    if (!role) return NextResponse.json({ error: 'ليس لديك متجر' })

    // 3. Force expire THEIR EXACT store
    const { error } = await admin.from('stores').update({ 
      plan: 'pro', 
      plan_expires_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() 
    }).eq('id', role.store_id)

    if (error) return NextResponse.json({ error: error.message })

    return NextResponse.json({ 
      success: true, 
      message: 'تم إرجاع المتجر الحقيقي للماضي بنجاح! اذهب للوحة السوبر أدمن الآن واضغط تنظيف.',
      realStoreId: role.store_id
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message })
  }
}
