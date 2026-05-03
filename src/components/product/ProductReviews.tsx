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

  return (
    <div className={`${isElegant ? 'bg-white border-y border-zinc-100 py-20' : 'bg-white rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 p-8 md:p-10'} mb-12`}>
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 ${isElegant ? 'max-w-4xl mx-auto px-6' : ''}`}>
        <div className={isElegant ? 'text-right space-y-2' : 'text-center md:text-right'}>
          <h2 className={`${isElegant ? 'text-3xl font-light tracking-tighter' : 'text-2xl font-black'} text-zinc-900`}>تقييمات العملاء</h2>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <span className={`font-black ${isElegant ? 'text-4xl text-zinc-900' : 'text-2xl text-zinc-800'}`}>{averageRating.toFixed(1)}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">({totalReviews} تقييم)</span>
            <div className={`flex items-center gap-1 ${isElegant ? 'text-zinc-900' : 'text-amber-400'}`}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(averageRating) ? 'fill-current' : isElegant ? 'text-zinc-100' : 'text-zinc-200'}`} strokeWidth={isElegant ? 1 : 2} />
              ))}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setFormVisible(!formVisible)}
          className={`${isElegant ? 'h-14 px-10 bg-zinc-900 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800' : 'rounded-2xl bg-zinc-900 px-6 py-4 text-sm font-bold shadow-lg shadow-zinc-200'} text-white transition-all active:scale-95 w-full md:w-auto`}
        >
          {formVisible ? 'إلغاء' : 'أضف تقييمك'}
        </button>
      </div>

      {formVisible && (
        <form onSubmit={handleSubmit} className={`${isElegant ? 'max-w-xl mx-auto mb-20 space-y-12' : 'mb-12 bg-zinc-50 rounded-3xl p-6 border border-zinc-100 animate-in fade-in slide-in-from-top-4'}`}>
          <div className="text-center space-y-4">
             <h3 className={`${isElegant ? 'text-2xl font-light italic' : 'text-lg font-black'} text-zinc-900`}>شاركنا رأيك في المنتج</h3>
          </div>
          
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">التقييم العام</label>
              <div className="flex justify-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none transition-transform hover:scale-110"
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => setRating(star)}
                  >
                    <Star 
                      className={`h-10 w-10 ${star <= (hoverRating || rating) ? (isElegant ? 'fill-zinc-900 text-zinc-900' : 'fill-amber-400 text-amber-400') : (isElegant ? 'text-zinc-100' : 'text-zinc-200')}`} 
                      strokeWidth={isElegant ? 1 : 2}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">الاسم <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكامل"
                className={`w-full ${isElegant ? 'bg-zinc-50 border-none p-6 italic' : 'rounded-xl border border-zinc-200 bg-white px-4 py-3 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'} text-sm outline-none transition-all`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">تعليقك (اختياري)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب تجربتك مع المنتج هنا..."
                rows={4}
                className={`w-full ${isElegant ? 'bg-zinc-50 border-none p-6 italic' : 'rounded-xl border border-zinc-200 bg-white px-4 py-3 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'} text-sm outline-none transition-all resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className={`w-full h-16 flex items-center justify-center gap-3 ${isElegant ? 'bg-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 shadow-xl' : 'rounded-xl bg-amber-500 text-sm font-bold hover:bg-amber-600 shadow-md'} text-white transition disabled:opacity-50`}
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className={`space-y-12 ${isElegant ? 'max-w-4xl mx-auto px-6' : ''}`}>
        {reviews.length === 0 ? (
          <div className={`text-center py-20 ${isElegant ? 'bg-zinc-50/50 border border-zinc-100' : 'bg-zinc-50 rounded-3xl border border-zinc-100 border-dashed'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">لا توجد تقييمات حالياً</p>
          </div>
        ) : (
          <div className={isElegant ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'space-y-6'}>
            {reviews.map((review) => (
              <div key={review.id} className={`${isElegant ? 'p-10 border border-zinc-100 hover:border-zinc-900' : 'p-6 rounded-3xl bg-zinc-50 border border-zinc-100'} transition-all duration-700`}>
                <div className="flex items-start gap-4">
                  {!isElegant && (
                    <div className="h-12 w-12 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                      <UserCircle2 className="h-7 w-7" />
                    </div>
                  )}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <p className={`font-black text-zinc-900 ${isElegant ? 'text-xs uppercase tracking-widest' : 'text-sm'}`}>{review.customer_name}</p>
                      <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">
                        {new Date(review.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className={`flex gap-1 ${isElegant ? 'text-zinc-900' : 'text-amber-400'}`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-current' : 'text-zinc-100'}`} strokeWidth={1} />
                      ))}
                    </div>
                    {review.comment && (
                      <p className={`text-zinc-600 leading-relaxed ${isElegant ? 'text-sm font-light italic' : 'text-sm font-bold'}`}>
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
