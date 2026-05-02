export interface Store {
  id: string;
  slug: string;
  name: string;
  owner_id: string | null;
  custom_domain: string | null;
  whatsapp_phone: string | null;
  is_active: boolean;
  plan: 'free' | 'basic' | 'pro';
  max_products: number;
  created_at: string;
}

export interface StoreBranding {
  id: string;
  store_id: string;
  logo_url: string | null;
  banner_url: string | null;
  favicon_url: string | null;
  logo_base64: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  tagline: string | null;
  footer_text: string | null;
  invoice_instapay: string | null;
  invoice_wallet: string | null;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  store_id: string;
  role: 'platform_admin' | 'merchant';
  created_at: string;
}
