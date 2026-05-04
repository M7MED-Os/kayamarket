'use client'

import { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'

interface CountdownTimerProps {
  endDate: string | Date
  selectedTheme?: string
}

export default function CountdownTimer({ endDate, selectedTheme = 'default' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  const isElegant = selectedTheme === 'elegant'

  useEffect(() => {
    const target = new Date(endDate).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = target - now

      if (distance < 0) {
        clearInterval(interval)
        setIsExpired(true)
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  if (isExpired || !timeLeft) return null

  const isFloral = selectedTheme === 'floral'

  return (
    <div className={`py-4 border-y border-zinc-50 flex items-center gap-6 ${isFloral ? 'bg-[#FAF3F0]/30 px-6 rounded-2xl border-none shadow-sm' : ''}`} dir="rtl">
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 rotate-180 [writing-mode:vertical-lr]">تنتهي قريباً</span>
      <div className="flex flex-col items-start justify-center gap-2 w-full" dir="rtl">
        <div className="flex items-center justify-center gap-1.5 text-zinc-900">
          <Timer className="h-3.5 w-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">ينتهي خلال:</span>
        </div>
        <div className="flex items-center gap-4" dir="ltr">
          <TimeUnit value={timeLeft.days} label="يوم" isFloral={isFloral} />
          <span className="text-zinc-200 font-light">:</span>
          <TimeUnit value={timeLeft.hours} label="ساعة" isFloral={isFloral} />
          <span className="text-zinc-200 font-light">:</span>
          <TimeUnit value={timeLeft.minutes} label="دقيقة" isFloral={isFloral} />
          <span className="text-zinc-200 font-light">:</span>
          <TimeUnit value={timeLeft.seconds} label="ثانية" isFloral={isFloral} />
        </div>
      </div>
    </div>
  )
}

function TimeUnit({ value, label, isFloral }: { value: number; label: string; isFloral?: boolean }) {
  return (
    <div className={`flex flex-col items-center min-w-[32px] ${isFloral ? 'bg-white/50 p-2 rounded-xl shadow-inner' : ''}`}>
      <span className={`text-xl font-light leading-none tracking-tight text-zinc-900 ${isFloral ? 'font-serif italic' : ''}`}>
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[9px] font-bold mt-1 text-zinc-400">{label}</span>
    </div>
  )
}
