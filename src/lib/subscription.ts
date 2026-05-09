/**
 * Subscription & Plan Configuration for KayaMarket
 * Centralized logic to manage feature limits and plan tiers.
 * Root-level engineering for plan enforcement.
 */

export type PlanTier = 'starter' | 'growth' | 'pro';

export interface PlanLimits {
  name: string;
  maxProducts: number;
  maxImagesPerProduct: number;
  maxCoupons: number;           // 0 = coupons disabled
  hasPdfInvoice: boolean;
  hasCustomBranding: boolean;
  hasHeroImage: boolean;
  hasCustomDomain: boolean;
  hasAdvancedAnalytics: boolean;
  canRemoveWatermark: boolean;
  hasProfessionalWhatsapp: boolean;
  priceMonthly?: number;
}

/**
 * INTERNAL NAMES MAPPING:
 * starter -> Free
 * growth  -> Pro
 * pro     -> Pro Plus
 */
export const PLAN_CONFIG: Record<PlanTier, PlanLimits> = {
  starter: {
    name: 'Free',
    maxProducts: 3,
    maxImagesPerProduct: 1,
    maxCoupons: 0,
    hasPdfInvoice: false,
    hasCustomBranding: false,
    hasHeroImage: false,
    hasCustomDomain: false,
    hasAdvancedAnalytics: false,
    canRemoveWatermark: false,
    hasProfessionalWhatsapp: false,
  },
  growth: {
    name: 'Pro',
    maxProducts: 100,
    maxImagesPerProduct: 5,
    maxCoupons: 20,
    hasPdfInvoice: true,
    hasCustomBranding: true,
    hasHeroImage: true,
    hasCustomDomain: false,
    hasAdvancedAnalytics: true,
    canRemoveWatermark: true,
    hasProfessionalWhatsapp: true,
  },
  pro: {
    name: 'Pro Plus',
    maxProducts: 1000,
    maxImagesPerProduct: 10,
    maxCoupons: 100,
    hasPdfInvoice: true,
    hasCustomBranding: true,
    hasHeroImage: true,
    hasCustomDomain: true,
    hasAdvancedAnalytics: true,
    canRemoveWatermark: true,
    hasProfessionalWhatsapp: true,
  }
};

/**
 * Utility: Fetch all plan configs from DB (Dynamic)
 * Falls back to PLAN_CONFIG if DB is unavailable.
 */
export async function getDynamicPlanConfigs(supabase: any): Promise<Record<PlanTier, PlanLimits>> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')

  if (error || !data || data.length === 0) return PLAN_CONFIG

  const dynamicConfig: any = {}
  data.forEach((p: any) => {
    dynamicConfig[p.id] = {
      name: p.name,
      maxProducts: p.max_products,
      maxImagesPerProduct: p.max_images_per_product,
      maxCoupons: p.max_coupons ?? 0,
      hasPdfInvoice: p.has_pdf_invoice,
      hasCustomBranding: p.has_custom_branding,
      hasHeroImage: p.has_hero_image ?? p.has_custom_branding, // Fallback to custom branding if column missing
      hasCustomDomain: p.has_custom_domain,
      hasAdvancedAnalytics: p.has_advanced_analytics,
      canRemoveWatermark: p.can_remove_watermark,
      hasProfessionalWhatsapp: p.has_professional_whatsapp ?? false,
      priceMonthly: p.price_monthly,
    }
  })
  return dynamicConfig
}

/**
 * Utility: Get plan config for a specific tier (static fallback)
 */
export function getPlanConfig(plan: PlanTier = 'starter'): PlanLimits {
  return PLAN_CONFIG[plan] || PLAN_CONFIG.starter;
}

/**
 * Utility: Check if a boolean feature is allowed
 */
export function isFeatureAllowed(
  plan: PlanTier,
  feature: keyof Omit<PlanLimits, 'name' | 'maxProducts' | 'maxImagesPerProduct' | 'maxCoupons' | 'priceMonthly'>
): boolean {
  return !!PLAN_CONFIG[plan]?.[feature];
}

/**
 * Utility: Check product limits
 */
export function checkProductLimit(currentCount: number, plan: PlanTier = 'starter'): { canAdd: boolean, limit: number } {
  const limit = PLAN_CONFIG[plan].maxProducts;
  return { canAdd: currentCount < limit, limit };
}

/**
 * Returns the human-readable name of the plan for UI display.
 */
export function getPlanName(tier: PlanTier): string {
  const names: Record<PlanTier, string> = {
    starter: 'مجاني',
    growth: 'برو',
    pro: 'برو بلس'
  };
  return names[tier] || 'مجاني';
}
