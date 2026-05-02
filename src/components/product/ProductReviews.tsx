'use client'

import { useState } from 'react'
import { Star, Send, UserCircle2 } from 'lucide-react'
import { submitProductReview } from '@/app/actions/reviews'
import toast from 'react-hot-toast'

interface Review {
  id: string
  customer_name: string
  rating: number
  comment: string | null
  created_at: string
}

export default function ProductReviews({ 
  productId, 
  storeId, 
  initialReviews = [],
  averageRating = 0,
  totalReviews = 0
}: { 
  productId: string
  storeId: string
  initialReviews: Review[]
  averageRating: number
  totalReviews: number
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  
  // Form State
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('برجاء كتابة اسمك')
      return
    }

    setIsSubmitting(true)
    
    const result = await submitProductReview(storeId, productId, name, rating, comment)
    
    setIsSubmitting(false)
    
    if (result.success) {
      toast.success('شكراً لك! تم إرسال تقييمك بنجاح وهو قيد المراجعة الآن.')
      setName('')
      setComment('')
      setRating(5)
      setFormVisible(false)
    } else {
      toast.error(result.error || 'حدث خطأ أثناء الإرسال')
    }
  }

  return (
    <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 p-8 md:p-10 mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-right">
          <h2 className="text-2xl font-black text-zinc-900 mb-2">تقييمات العملاء</h2>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <span className="text-2xl font-black text-zinc-800">{averageRating.toFixed(1)}</span>
            <span className="text-sm font-bold text-zinc-400">({totalReviews} تقييم)</span>
            <div className="flex items-center text-amber-400 gap-0.5">
              {(() => {
                const full = Math.floor(averageRating)
                const remainder = averageRating % 1
                const half = remainder >= 0.25 && remainder < 0.75
                const extraFull = remainder >= 0.75 ? 1 : 0
                const totalFull = full + extraFull
                const empty = Math.max(0, 5 - totalFull - (half ? 1 : 0))

                return (
                  <>
                    {Array.from({ length: totalFull }).map((_, i) => (
                      <Star key={`f${i}`} className="h-5 w-5 fill-current" />
                    ))}
                    {half && (
                      <span className="relative inline-block h-5 w-5">
                        <Star className="absolute h-5 w-5 text-zinc-200 fill-zinc-200" />
                        <span className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
                          <Star className="absolute right-0 h-5 w-5 fill-amber-400 text-amber-400" />
                        </span>
                      </span>
                    )}
                    {Array.from({ length: empty }).map((_, i) => (
                      <Star key={`e${i}`} className="h-5 w-5 text-zinc-200 fill-zinc-200" />
                    ))}
                  </>
                )
              })()}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="rounded-2xl bg-zinc-900 px-6 py-4 text-sm font-bold text-white hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200 w-full md:w-auto"
        >
          {formVisible ? 'إلغاء' : 'أضف تقييمك'}
        </button>
      </div>

      {formVisible && (
        <form onSubmit={handleSubmit} className="mb-12 bg-zinc-50 rounded-3xl p-6 border border-zinc-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-black text-zinc-900 mb-6">شاركنا رأيك في المنتج</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">التقييم العام</label>
              <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => setRating(star)}
                  >
                    <Star 
                      className={`h-8 w-8 ${star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1">الاسم <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكامل"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1">تعليقك (اختياري)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب تجربتك مع المنتج هنا..."
                rows={4}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 h-12 text-sm font-bold text-white transition hover:bg-amber-600 shadow-md disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 rounded-3xl border border-zinc-100 border-dashed">
            <p className="text-zinc-400 font-bold">لا توجد تقييمات حتى الآن. كن أول من يقيّم هذا المنتج!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                  <UserCircle2 className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <p className="font-bold text-zinc-900 text-sm">{review.customer_name}</p>
                    <p className="text-[11px] font-bold text-zinc-400">
                      {new Date(review.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex text-amber-400 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : 'text-zinc-200'}`} 
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm font-bold text-zinc-600 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
