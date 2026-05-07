'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPlatformThemes() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
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
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('platform_themes')
    .update(updates)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/super-admin/themes')
  return { success: true }
}

export async function disableThemeAndMigrate(themeId: string, fallbackThemeId: string = 'default') {
  const supabase = createAdminClient()

  // 1. Update the theme status
  const { error: themeError } = await supabase
    .from('platform_themes')
    .update({ is_active: false, is_visible: false })
    .eq('id', themeId)

  if (themeError) throw themeError

  // 2. Migrate all stores using this theme to the fallback theme
  const { error: migrateError } = await supabase
    .from('store_branding')
    .update({ selected_theme: fallbackThemeId })
    .eq('selected_theme', themeId)

  if (migrateError) throw migrateError

  revalidatePath('/super-admin/themes')
  revalidatePath('/admin/settings')
  return { success: true, count: 0 } // count would be nice but update doesn't return count easily in this wrapper
}

export async function addPlatformTheme(theme: any) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('platform_themes')
    .insert([theme])

  if (error) throw error
  revalidatePath('/super-admin/themes')
  return { success: true }
}
