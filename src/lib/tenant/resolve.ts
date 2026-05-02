// PURE FUNCTION — no DB calls, no side effects
export function resolveStoreSlug(hostname: string, searchParams?: URLSearchParams): string | null {
  if (!hostname) return null;

  // 1. Normalize
  hostname = hostname.replace(/^www\./, '').split(':')[0];

  // 2. Query param (dev mode)
  const paramSlug = searchParams?.get('store');
  if (paramSlug) return paramSlug;

  // 3. Preview domains (vercel, etc) → use param or null
  if (hostname.includes('vercel.app')) return paramSlug || null;

  // 4. Subdomain
  const baseDomain = process.env.BASE_DOMAIN?.split(':')[0];
  if (baseDomain && hostname.endsWith(baseDomain) && hostname !== baseDomain) {
    const sub = hostname.replace(`.${baseDomain}`, '');
    if (sub && sub !== 'www') return sub;
  }

  // 5. Custom domain
  // Custom domain resolution happens down the line by querying `stores.custom_domain`
  // But middleware shouldn't query DB. For custom domains, if it doesn't match base domain,
  // we just return the full hostname and let the DB fetching logic handle it by matching `custom_domain`.
  // Actually, wait: the requirement says: "Must resolve store from: Custom domain support (via hostname match)".
  // Since middleware can't query DB, we just return the hostname. The fetcher will query `stores.custom_domain = hostname`.
  // Wait, the output must be "string | null (store slug)".
  // If it's a custom domain, we can't extract the slug without DB.
  // We can return the hostname itself and let `getStoreBySlug` (which will be renamed or enhanced) handle it.
  // Or better: the returned value is `identifier`.
  return hostname;
}
