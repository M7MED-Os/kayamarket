export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number | null;
  original_price: number | null;
  image_url: string | null;
  images: string[];
  category?: string;
  views_count?: number;
  stock: number | null;
  sale_end_date: string | null;
  is_visible: boolean;
  created_at: string;
}
