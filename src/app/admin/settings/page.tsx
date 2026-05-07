import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'
import { PlanTier, getDynamicPlanConfigs } from '@/lib/subscription'

export const metadata = {
  title: 'الإعدادات والهوية | لوحة تحكم التاجر',
}

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  let storeId: string

  try {
    const authData = await assertMerchant(supabase)
    storeId = authData.storeId
  } catch (error) {
    redirect('/login')
  }

  // 1. Fetch Store Data (for Name & Phone & Plan & Expiry)
  const { data: store } = await supabase
    .from('stores')
    .select('name, whatsapp_phone, plan, created_at, plan_expires_at')
    .eq('id', storeId)
    .single()

  const rawPlan = store?.plan || 'starter'
  const storePlan = (rawPlan === 'free' ? 'starter' : rawPlan) as PlanTier

  // 2. Fetch Branding Data
  const { data: branding, error: brandingError } = await supabase
    .from('store_branding')
    .select('*')
    .eq('store_id', storeId)
    .single()

  // 3. Fetch Policies/Settings
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('store_id', storeId)
    .single()

  // 4. Fetch all plans for comparison
  const allPlans = await getDynamicPlanConfigs(supabase)

  // 5. Fetch available themes
  const { data: themes } = await supabase
    .from('platform_themes')
    .select('*')
    .eq('is_visible', true)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  // 6. Get User Email for Auto-fill
  const { data: { user } } = await supabase.auth.getUser()

  if (brandingError && brandingError.code !== 'PGRST116') {
    return <div className="text-red-500">حدث خطأ أثناء تحميل الإعدادات.</div>
  }

  return (
    <div className="space-y-6">


      <SettingsForm 
        initialStore={store}
        initialBranding={branding} 
        initialSettings={settings}
        plan={storePlan}
        allPlans={allPlans}
        userEmail={user?.email}
        themes={themes || []}
      />
    </div>
  )
}
