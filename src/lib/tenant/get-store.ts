import { unstable_cache } from 'next/cache';
import { createClient, createPublicClient } from '@/lib/supabase/server';
import { Store, StoreBranding } from '@/types/store';

// ─── Internal fetchers (not exported) ────────────────────────────────────────
// The Supabase client is created INSIDE the cached function so the cache key
// is only the store identifier — not an un-serializable client object.

async function _fetchStoreById(
  storeId: string,
): Promise<{ store: Store | null; branding: StoreBranding | null }> {
  const supabase = await createPublicClient();
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();
  if (!store) return { store: null, branding: null };

  const { data: branding } = await supabase
    .from('store_branding')
    .select('*')
    .eq('store_id', storeId)
    .single();
  return { store, branding };
}

async function _fetchStoreByIdentifier(
  identifier: string,
): Promise<{ store: Store | null; branding: StoreBranding | null }> {
  const supabase = await createPublicClient();

  // Try slug first (most common path)
  let { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', identifier)
    .eq('is_active', true)
    .single();

  // Fall back to custom_domain match
  if (!store) {
    const { data: byDomain } = await supabase
      .from('stores')
      .select('*')
      .eq('custom_domain', identifier)
      .eq('is_active', true)
      .single();
    store = byDomain;
  }

  if (!store) return { store: null, branding: null };

  const { data: branding } = await supabase
    .from('store_branding')
    .select('*')
    .eq('store_id', store.id)
    .single();
  return { store, branding };
}

// ─── Public helpers — cached at 5-minute TTL ──────────────────────────────────

/**
 * Look up a store by its UUID. Cached for 5 minutes.
 * Does NOT accept a Supabase client — creates one internally so the cache
 * key stays serializable.
 */
export const getStoreById = unstable_cache(
  _fetchStoreById,
  ['store-by-id'],
  { revalidate: 300, tags: ['stores'] },
);

/**
 * Look up a store by slug or custom domain. Cached for 5 minutes.
 * Does NOT accept a Supabase client — creates one internally so the cache
 * key stays serializable.
 */
export const getStoreByIdentifier = unstable_cache(
  _fetchStoreByIdentifier,
  ['store-by-identifier'],
  { revalidate: 300, tags: ['stores'] },
);
