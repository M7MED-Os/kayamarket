'use client'

import { Product } from "@/types/product";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ product, className }: { product: Product, className?: string }) {
  const whatsappUrl = generateWhatsAppLink(product);

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        window.open(whatsappUrl, '_blank');
      }}
      className={`inline-flex items-center justify-center rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#20ba5a] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 gap-2 ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
      <span>اطلب عبر واتساب</span>
    </button>
  );
}
