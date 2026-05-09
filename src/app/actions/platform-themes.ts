'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { assertSuperAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getPlatformThemes() {
  // 🔒 Auth Guard: Only Super Admin
  const supabase = await createClient()
  await assertSuperAdmin(supabase)
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('platform_themes')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching themes:', error)
    return []
  }

  // Fetch usage stats for each theme
  const themesWithStats = await Promise.all(data.map(async (theme) => {
    const { count } = await supabase
      .from('store_branding')
      .select('*', { count: 'exact', head: true })
      .eq('selected_theme', theme.id)
    
    return {
      ...theme,
      active_stores: count || 0
    }
  }))

  return themesWithStats
}

export async function updateThemeSettings(id: string, updates: any) {
  // 🔒 Auth Guard: Only Super Admin
  const supabase = await createClient()
  await assertSuperAdmin(supabase)
  const admin = createAdminClient()

  // If setting as default, first unset other defaults
  if (updates.is_default === true) {
    await admin
      .from('platform_themes')
      .update({ is_default: false })
      .neq('id', id)
  }

  const { error } = await admin
    .from('platform_themes')
    .update(updates)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/super-admin/themes')
  return { success: true }
}

export async function disableThemeAndMigrate(themeId: string, fallbackThemeId: string = 'default') {
  // 🔒 Auth Guard: Only Super Admin
  const supabase = await createClient()
  await assertSuperAdmin(supabase)
  const admin = createAdminClient()

  // 1. Update the theme status
  const { error: themeError } = await admin
    .from('platform_themes')
    .update({ is_active: false, is_visible: false })
    .eq('id', themeId)

  if (themeError) throw themeError

  // 2. Migrate all stores using this theme to the fallback theme
  const { error: migrateError } = await admin
    .from('store_branding')
    .update({ selected_theme: fallbackThemeId })
    .eq('selected_theme', themeId)

  if (migrateError) throw migrateError

  revalidatePath('/super-admin/themes')
  revalidatePath('/admin/settings')
  return { success: true, count: 0 } // count would be nice but update doesn't return count easily in this wrapper
}

export async function addPlatformTheme(theme: any) {
  // 🔒 Auth Guard: Only Super Admin
  const supabase = await createClient()
  await assertSuperAdmin(supabase)
  const admin = createAdminClient()
  const { error } = await admin
    .from('platform_themes')
    .insert([theme])

  if (error) throw error
  revalidatePath('/super-admin/themes')
  return { success: true }
}
