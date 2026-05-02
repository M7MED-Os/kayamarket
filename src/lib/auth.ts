import { SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_STORE_ID = '00000000-0000-0000-0000-000000000001';

// 🔒 ALWAYS queries DB. NEVER trusts cookies.
export async function assertMerchant(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('NOT_AUTHENTICATED');
  }

  const { data: role } = await supabase
    .from('user_roles')
    .select('store_id, role')
    .eq('user_id', user.id)
    .single();

  if (!role) {
    throw new Error('NO_STORE_ACCESS');
  }

  return {
    userId: user.id,
    storeId: role.store_id,
    role: role.role
  };
}

/**
 * 🔐 Super Admin Gatekeeper
 * Uses Admin Client to bypass RLS for platform management.
 */
import { createAdminClient } from '@/lib/supabase/server'

export async function assertSuperAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('NOT_AUTHENTICATED');
  }

  // Use Admin Client to bypass RLS for this specific check
  const admin = createAdminClient()
  const { data: role } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'super_admin')
    .maybeSingle();

  if (!role) {
    throw new Error('FORBIDDEN_NOT_SUPER_ADMIN');
  }

  return {
    userId: user.id,
    role: role.role
  };
}
