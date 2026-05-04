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
  totalReviews = 0,
  selectedTheme = 'default'
}: {
  productId: string
  storeId: string
  initialReviews: Review[]
  averageRating: number
  totalReviews: number
  selectedTheme?: string
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
      toast.success('شكراً لك! تم إرسال تقييمك بنجاح.')
      setName('')
      setComment('')
      setRating(5)
      setFormVisible(false)
    } else {
      toast.error(result.error || 'حدث خطأ أثناء الإرسال')
    }
  }

  const isElegant = selectedTheme === 'elegant'

  const isFloral = selectedTheme === 'floral'

  return (
    <div className={`${isFloral ? 'bg-[#FAF3F0]/20' : 'bg-white'} border-y border-zinc-100 py-20 mb-12`} dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 max-w-4xl mx-auto px-6">
        <div className="text-right space-y-2">
          <h2 className="text-3xl font-light tracking-tighter text-zinc-900">تقييمات العملاء</h2>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <span className="font-black text-4xl text-[var(--primary)]">{averageRating.toFixed(1)}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">({totalReviews} تقييم)</span>
            <div className="flex items-center gap-1 text-[var(--primary)]">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(averageRating) ? 'fill-current' : 'text-zinc-100'}`} strokeWidth={1} />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setFormVisible(!formVisible)}
          className={`h-14 px-10 bg-[var(--primary)] text-[10px] font-black uppercase tracking-widest hover:brightness-125 disabled:brightness-75 ${isFloral ? 'rounded-xl' : 'rounded-none'} text-white transition-all active:scale-95 w-full md:w-auto`}
        >
          {formVisible ? 'إلغاء' : 'أضف تقييمك'}
        </button>
      </div>

      {formVisible && (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-20 space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-light italic text-zinc-900">شاركنا رأيك في المنتج</h3>
          </div>

          <div className="space-y-8">
            <div className="text-center space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">التقييم العام</label>
              <div className="flex justify-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onMouseEnter={() => setHoverRating(star)} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                    <Star className={`h-10 w-10 ${star <= (hoverRating || rating) ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-zinc-100'}`} strokeWidth={1} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">الاسم <span className="text-red-500">*</span></label>
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="اسمك الكامل" className={`w-full bg-zinc-50 border-none p-6 italic ${isFloral ? 'rounded-xl' : 'rounded-none'} focus:ring-1 focus:ring-[var(--primary)] text-sm outline-none transition-all`} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">تعليقك (اختياري)</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="اكتب تجربتك مع المنتج هنا..." rows={4} className={`w-full bg-zinc-50 border-none p-6 italic ${isFloral ? 'rounded-xl' : 'rounded-none'} focus:ring-1 focus:ring-[var(--primary)] text-sm outline-none transition-all resize-none`} />
            </div>

            <button type="submit" disabled={isSubmitting || !name.trim()} className={`w-full h-16 flex items-center justify-center gap-3 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-125 disabled:brightness-75 ${isFloral ? 'rounded-xl' : 'rounded-none'} shadow-xl transition disabled:opacity-50`}>
              <Send className="h-4 w-4" />
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-12 max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.length === 0 ? (
            <div className={`col-span-full text-center py-20 ${isFloral ? 'bg-zinc-50/20' : 'bg-zinc-50/50'} border border-zinc-100 ${isFloral ? 'rounded-2xl' : ''}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">لا توجد تقييمات حالياً</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className={`p-8 border border-zinc-100 hover:border-[var(--primary)] transition-all duration-700 ${isFloral ? 'rounded-2xl bg-white/40' : ''}`}>
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex justify-between items-center gap-4">
                      <p className="font-black text-zinc-900 truncate text-xs uppercase tracking-widest">{review.customer_name}</p>
                      <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest whitespace-nowrap">
                        {new Date(review.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex gap-1 text-[var(--primary)]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-current' : 'text-zinc-100'}`} strokeWidth={1} />
                      ))}
                    </div>

                    {review.comment && (
                      <p className="text-zinc-600 leading-relaxed text-sm font-light italic">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
