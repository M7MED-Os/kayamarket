'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Clock, CheckCircle, Package, PackageCheck } from 'lucide-react'
import { submitStoreReview, submitProductReview } from '@/app/actions/reviews'
import { fetchOrderForTracking } from '@/app/actions/track'
import toast from 'react-hot-toast'
import Loading from '@/app/loading'

// Dynamic Imports for Track Views
const TrackViews = {
  elegant: dynamic(() => import('@/components/store/track-views/ElegantTrack'), { loading: () => <Loading /> }),
  floral: dynamic(() => import('@/components/store/track-views/FloralTrack'), { loading: () => <Loading /> }),
  organic: dynamic(() => import('@/components/store/track-views/OrganicTrack'), { loading: () => <Loading /> }),
  default: dynamic(() => import('@/components/store/track-views/DefaultTrack'), { loading: () => <Loading /> }),
}

const STATUS_STEPS = [
  { id: 'pending', label: 'قيد المراجعة', icon: Clock },
  { id: 'confirmed', label: 'تم التأكيد', icon: CheckCircle },
  { id: 'processing', label: 'تم التجهيز', icon: Package },
  { id: 'delivered', label: 'تم التوصيل', icon: PackageCheck },
]

export default function TrackOrderClient({ store, branding, slug, showWatermark }: any) {
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [order, setOrder] = useState<any>(null)

  const [storeRating, setStoreRating] = useState(5)
  const [storeComment, setStoreComment] = useState('')

  const [productReviews, setProductReviews] = useState<Record<string, { rating: number; comment: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const primaryColor = branding?.primary_color || '#0ea5e9'
  const selectedTheme = (branding as any)?.selected_theme || 'default'
  const commonStyles = {
    '--primary': primaryColor,
    'fontFamily': branding?.font_family || 'Cairo'
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim() || !phone.trim()) {
      toast.error('برجاء إدخال كود الطلب ورقم التليفون')
      return
    }
    setIsSearching(true)
    const res = await fetchOrderForTracking(store.id, orderId, phone)
    setIsSearching(false)

    if (res.success && res.order) {
      setOrder(res.order)
      setIsSubmitted(false)

      const pReviews: any = {}
      if (res.order.order_items?.length > 0) {
        res.order.order_items.forEach((item: any) => {
          if (item.product_id) pReviews[item.product_id] = { rating: 5, comment: '' }
        })
      } else if (res.order.product_id) {
        pReviews[res.order.product_id] = { rating: 5, comment: '' }
      }
      setProductReviews(pReviews)
    } else {
      toast.error(res.error || 'حدث خطأ')
    }
  }

  const handleCombinedReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const promises = [submitStoreReview(store.id, order.customer_name, storeRating, storeComment)]
    Object.keys(productReviews).forEach(pid => {
      promises.push(submitProductReview(store.id, pid, order.customer_name, productReviews[pid].rating, productReviews[pid].comment))
    })
    const results = await Promise.all(promises)
    const storeRes = results[0]
    const productSuccess = Object.keys(productReviews).length === 0 || results.slice(1).every(r => r.success)
    setIsSubmitting(false)
    if (storeRes.success && productSuccess) {
      toast.success('تم إرسال التقييمات بنجاح!')
      setIsSubmitted(true)
    } else {
      toast.error('حدث خطأ أثناء إرسال التقييمات')
      if (storeRes.success || productSuccess) setIsSubmitted(true)
    }
  }

  if (!mounted) return null

  const CurrentTrackView = (TrackViews as any)[selectedTheme] || TrackViews.default

  return (
    <CurrentTrackView
      slug={slug}
      store={store}
      branding={branding}
      order={order}
      orderId={orderId}
      setOrderId={setOrderId}
      phone={phone}
      setPhone={setPhone}
      isSearching={isSearching}
      handleSearch={handleSearch}
      setOrder={setOrder}
      STATUS_STEPS={STATUS_STEPS}
      storeRating={storeRating}
      setStoreRating={setStoreRating}
      storeComment={storeComment}
      setStoreComment={setStoreComment}
      productReviews={productReviews}
      setProductReviews={setProductReviews}
      isSubmitting={isSubmitting}
      isSubmitted={isSubmitted}
      handleCombinedReview={handleCombinedReview}
      showWatermark={!!showWatermark}
      commonStyles={commonStyles}
    />
  )
}
