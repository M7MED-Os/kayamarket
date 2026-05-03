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

  if (isElegant) {
    return (
      <div className="flex flex-col items-start justify-center gap-2 w-full" dir="rtl">
        <div className="flex items-center justify-center gap-1.5 text-zinc-900">
          <Timer className="h-3.5 w-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">ينتهي خلال:</span>
        </div>
        
        <div className="flex items-center gap-4" dir="ltr">
          <TimeUnit value={timeLeft.days} label="يوم" isElegant={true} />
          <span className="text-zinc-200 font-light">:</span>
          <TimeUnit value={timeLeft.hours} label="ساعة" isElegant={true} />
          <span className="text-zinc-200 font-light">:</span>
          <TimeUnit value={timeLeft.minutes} label="دقيقة" isElegant={true} />
          <span className="text-zinc-200 font-light">:</span>
          <TimeUnit value={timeLeft.seconds} label="ثانية" isElegant={true} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1 w-full bg-zinc-900/80 backdrop-blur-md rounded-[1.25rem] py-2 px-3 shadow-2xl border border-white/10">
      <div className="flex items-center justify-center gap-1.5 text-white mb-0.5">
        <Timer className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-100">ينتهي العرض خلال:</span>
      </div>
      
      <div className="flex items-center justify-center gap-2 w-full" dir="ltr">
        <TimeUnit value={timeLeft.days} label="يوم" />
        <span className="text-white/30 font-black mb-3">:</span>
        <TimeUnit value={timeLeft.hours} label="ساعة" />
        <span className="text-white/30 font-black mb-3">:</span>
        <TimeUnit value={timeLeft.minutes} label="دقيقة" />
        <span className="text-white/30 font-black mb-3">:</span>
        <TimeUnit value={timeLeft.seconds} label="ثانية" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label, isElegant }: { value: number; label: string; isElegant?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[32px]">
      <span className={`text-xl font-light leading-none tracking-tight ${isElegant ? 'text-zinc-900' : 'text-white font-black'}`}>
        {value.toString().padStart(2, '0')}
      </span>
      <span className={`text-[9px] font-bold mt-1 ${isElegant ? 'text-zinc-400' : 'text-zinc-400'}`}>{label}</span>
    </div>
  )
}
