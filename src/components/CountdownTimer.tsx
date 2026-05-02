'use client'

import { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'

interface CountdownTimerProps {
  endDate: string | Date
}

export default function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)
  const [isExpired, setIsExpired] = useState(false)

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

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[32px]">
      <span className="text-lg font-black text-white leading-none tracking-tight">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[9px] font-bold text-zinc-400 mt-1">{label}</span>
    </div>
  )
}
