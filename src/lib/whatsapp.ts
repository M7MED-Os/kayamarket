import { Product } from "@/types/product";

export function generateWhatsAppLink(product: Product, storePhone?: string): string {
  if (!storePhone) {
    console.warn('[WhatsApp] No store phone number provided for product:', product.id);
    return '#';
  }

  const phone = storePhone.replace(/\D/g, '');

  const message = `مرحباً 👋، أريد طلب هذا المنتج:

📦 الاسم: ${product.name}
🔑 الرقم: ${product.id}
💰 السعر: ${product.price ? `${product.price} ج.م` : "يُحدد عند التواصل"}

أرجو التواصل معي للتأكيد. شكراً!`;

  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
}
