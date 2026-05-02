'use client'

import { useState, useMemo } from 'react'
import { Star } from 'lucide-react'

interface Review {
  id: string
  reviewer_name?: string
  customer_name?: string
  rating: number
  comment: string
  created_at: string
}

export default function TestimonialsMarquee({ reviews }: { reviews: Review[] }) {
  const [isPaused, setIsPaused] = useState(false)

  const displayReviews = useMemo(() => {
    const base = reviews && reviews.length > 0 ? reviews : [
      { id: 'f1', reviewer_name: 'أحمد محمود', rating: 5, comment: 'تجربة ممتازة ومنتجات بجودة عالية جداً، سأكرر التجربة بالتأكيد.', created_at: new Date().toISOString() },
      { id: 'f2', reviewer_name: 'سارة خالد', rating: 5, comment: 'توصيل سريع وتغليف رائع، شكراً لكم على هذا الرقي.', created_at: new Date().toISOString() },
      { id: 'f3', reviewer_name: 'محمد علي', rating: 4, comment: 'خدمة عملاء راقية وسرعة في الرد والاستجابة.', created_at: new Date().toISOString() },
      { id: 'f4', reviewer_name: 'نورة عبدالله', rating: 5, comment: 'أفضل متجر تعاملت معه، أنصح الجميع بالتجربة!', created_at: new Date().toISOString() },
    ]
    return base.slice(0, 10)
  }, [reviews])

  const repeatedSet = useMemo(() => {
    const minItems = 10
    const repeatCount = Math.ceil(minItems / displayReviews.length)
    return Array.from({ length: repeatCount }).flatMap(() => displayReviews)
  }, [displayReviews])

  const duration = repeatedSet.length * 10

  return (
    <div className="w-full py-12 overflow-hidden relative select-none group" dir="ltr">
      {/* Soft Side Fades */}
      <div className="absolute right-0 top-0 h-full w-24 md:w-32 bg-gradient-to-l from-white via-white/70 to-transparent z-20 pointer-events-none" />
      <div className="absolute left-0 top-0 h-full w-24 md:w-32 bg-gradient-to-r from-white via-white/70 to-transparent z-20 pointer-events-none" />

      <div
        className="flex w-max flex-nowrap animate-marquee-infinite"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          animationDuration: `${duration}s`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        <div className="flex flex-nowrap gap-8 px-4 bg-transparent">
          {repeatedSet.map((review, idx) => (
            <ReviewCard key={`a-${idx}`} review={review} />
          ))}
        </div>

        <div className="flex flex-nowrap gap-8 px-4 bg-transparent" aria-hidden="true">
          {repeatedSet.map((review, idx) => (
            <ReviewCard key={`b-${idx}`} review={review} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-infinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-infinite {
          animation: marquee-infinite linear infinite;
        }
      `}</style>
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const name = review.reviewer_name || review.customer_name || 'عميل مجهول'

  return (
    <div
      dir="rtl"
      className="w-[300px] md:w-[380px] shrink-0 bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-300 flex flex-col justify-between min-h-[260px] md:min-h-[300px]"
    >
      <div className="text-right">
        {/* Amber Stars */}
        <div className="flex items-center justify-start gap-0.5 mb-5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 md:h-5 md:w-5 ${i < Math.floor(review.rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-zinc-100'
                }`}
            />
          ))}
        </div>

        {/* Prominent Comment */}
        <p className="text-zinc-800 text-sm md:text-lg leading-relaxed font-bold line-clamp-4">
          "{review.comment || 'تجربة رائعة جداً، شكراً لكم على الرقي وجودة المنتجات.'}"
        </p>
      </div>

      {/* User Footer */}
      <div className="flex items-center gap-4 border-t border-zinc-50 pt-6 mt-6">
        <div
          className="h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center font-black text-white text-base md:text-lg shrink-0 shadow-sm"
          style={{ background: 'var(--primary)' }}
        >
          {name.charAt(0)}
        </div>
        <div className="overflow-hidden">
          <span className="text-zinc-900 text-sm md:text-base font-black block truncate">{name}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">عميل موثق</span>
          </div>
        </div>
      </div>
    </div>
  )
}