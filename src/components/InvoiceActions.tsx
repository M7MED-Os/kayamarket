'use client'

import { Printer, MessageCircle, Share2, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import UpgradeModal from './UpgradeModal'

interface InvoiceActionsProps {
  order: any
  hasPdfInvoice?: boolean
  storeName?: string
  whatsappUrl?: string | null
}

export default function InvoiceActions({ order, hasPdfInvoice = false, storeName = 'المتجر', whatsappUrl = null, primaryColor = '#0ea5e9' }: InvoiceActionsProps & { primaryColor?: string }) {
  const [currentUrl, setCurrentUrl] = useState('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Debug log

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const handleDownload = async () => {
    if (!hasPdfInvoice) {
      setShowUpgradeModal(true)
      return
    }

    if (isGeneratingPdf) return
    setIsGeneratingPdf(true)

    try {
      // Handle the fact that RPC returns order_id instead of id
      const actualOrderId = order.order_id || order.id
      
      if (!actualOrderId) {
        throw new Error('Order ID is missing')
      }

      // Extract the token from the current URL if it exists
      const urlObj = new URL(window.location.href)
      const token = urlObj.searchParams.get('token')
      
      const apiUrl = token 
        ? `${window.location.origin}/api/invoice/${actualOrderId}/pdf?token=${token}`
        : `${window.location.origin}/api/invoice/${actualOrderId}/pdf`

      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error('Failed to generate PDF')

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      const shortId = actualOrderId.split('-')[0].toUpperCase()
      a.download = `Invoice-${shortId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('PDF Download Error:', error)
      toast.error('حدث خطأ أثناء تحميل الفاتورة. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleNativeShare = async () => {
    if (!hasPdfInvoice) {
      setShowUpgradeModal(true)
      return
    }

    if (isGeneratingPdf) return
    setIsGeneratingPdf(true)

    try {
      const actualOrderId = order.order_id || order.id
      if (!actualOrderId) throw new Error('Order ID is missing')

      const urlObj = new URL(window.location.href)
      const token = urlObj.searchParams.get('token')
      const apiUrl = token 
        ? `/api/invoice/${actualOrderId}/pdf?token=${token}`
        : `/api/invoice/${actualOrderId}/pdf`

      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error('Failed to generate PDF')

      const blob = await response.blob()
      const shortId = actualOrderId.split('-')[0].toUpperCase()
      const file = new File([blob], `Invoice-${shortId}.pdf`, { type: 'application/pdf' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'فاتورة الطلب',
          text: `فاتورة الطلب رقم #${shortId}`
        })
      } else {
        // Fallback to direct download if sharing files is not supported
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
      }
    } catch (error) {
      console.error('Error sharing PDF:', error)
      toast.error('حدث خطأ أثناء المشاركة.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-3xl mx-auto no-print mt-2">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#20bd5a] shadow-lg shadow-[#25D366]/20"
          >
            <MessageCircle className="h-5 w-5" />
            أرسل الطلب عبر واتساب
          </a>
        )}

        <button
          onClick={handleDownload}
          disabled={isGeneratingPdf}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 shadow-lg disabled:opacity-70 disabled:cursor-wait"
          style={{ background: primaryColor, boxShadow: `0 10px 20px -5px color-mix(in srgb, ${primaryColor}, transparent 70%)` }}
        >
          {isGeneratingPdf ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Printer className="h-5 w-5" />
          )}
          {isGeneratingPdf ? 'جاري التحضير...' : 'تنزيل PDF'}
        </button>

        <button
          onClick={handleNativeShare}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition hover:bg-zinc-50 active:scale-95"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          <Share2 className="h-5 w-5" />
          مشاركة الفاتورة PDF
        </button>
      </div>

      {/* Subscription Lock Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="تنزيل PDF غير متاح"
        description={`عذراً، ميزة تحميل الفواتير بصيغة PDF غير مفعلة حالياً لمتجر "${storeName}". يمكنك لقطة شاشة للاحتفاظ ببيانات طلبك.`}
        limitName="الحالة"
        limitValue="غير مفعلة"
      />
    </>
  )
}
