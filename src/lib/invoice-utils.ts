export function generateWhatsAppInvoiceMessage(order: any, storePhone?: string) {
  if (!storePhone) {
    console.warn('[Invoice] No store phone number provided for order:', order.id);
    return '#';
  }

  const shortId = order.id.split('-')[0].toUpperCase()
  const total = Number(order.final_price).toFixed(2)
  const phone = storePhone.replace(/\D/g, '')
  
  const text = `اهلا بيك👋\nأرسل لكم فاتورة الطلب:\n\n🧾 رقم الفاتورة: #${shortId}\n💰 الإجمالي: ${total} ج.م\n\nيرجى تأكيد الطلب. شكراً!`
  
  const encodedText = encodeURIComponent(text)
  return `https://wa.me/${phone}?text=${encodedText}`
}
