'use client'

import { TrendingUp, Award, Target, Zap, Crown } from 'lucide-react'
import { useMemo } from 'react'

interface GamificationProps {
  salesData: any[]
  totalOrders: number
}

export default function DashboardGamification({ salesData, totalOrders }: GamificationProps) {
  const performance = useMemo(() => {
    if (salesData.length < 2) return { growth: 0, status: 'neutral' }
    
    // Simple comparison: Last 7 days vs previous 7 days
    const midpoint = Math.floor(salesData.length / 2)
    const recent = salesData.slice(0, midpoint).reduce((sum, d) => sum + Number(d.revenue), 0)
    const previous = salesData.slice(midpoint).reduce((sum, d) => sum + Number(d.revenue), 0)
    
    if (previous === 0) return { growth: recent > 0 ? 100 : 0, status: 'positive' }
    const growth = ((recent - previous) / previous) * 100
    if (isNaN(growth)) return { growth: 0, status: 'neutral' }
    return { 
      growth: Math.round(growth), 
      status: growth >= 0 ? 'positive' : 'negative' 
    }
  }, [salesData])

  const rank = useMemo(() => {
    if (totalOrders > 100) return { title: 'تاجر أسطوري', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-50' }
    if (totalOrders > 50) return { title: 'سوبر تاجر', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' }
    if (totalOrders > 10) return { title: 'تاجر نشط', icon: Zap, color: 'text-sky-500', bg: 'bg-sky-50' }
    return { title: 'تاجر طموح', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' }
  }, [totalOrders])

  const RankIcon = rank.icon

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 🏆 Rank Card */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 ${rank.bg} ${rank.color} shadow-inner group-hover:scale-110 transition-transform`}>
          <RankIcon className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">رتبة المتجر الحالية</p>
          <h3 className={`text-2xl font-black ${rank.color}`}>{rank.title}</h3>
          <p className="text-[10px] font-bold text-slate-400">لقد حققت {totalOrders} طلباً ناجحاً حتى الآن! 🚀</p>
        </div>
      </div>

      {/* 📈 Growth Card */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 ${performance.status === 'positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} shadow-inner group-hover:scale-110 transition-transform`}>
          <TrendingUp className={`h-8 w-8 ${performance.status === 'negative' ? 'rotate-180' : ''}`} strokeWidth={2.5} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">نمو المبيعات</p>
          <h3 className={`text-2xl font-black ${performance.status === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {performance.growth > 0 ? '+' : ''}{performance.growth}%
          </h3>
          <p className="text-[10px] font-bold text-slate-400">
            {performance.status === 'positive' 
              ? 'مبيعاتك هذا الأسبوع أفضل من الأسبوع الماضي! استمر 🔥' 
              : 'هناك تراجع بسيط، حاول إطلاق عرض ترويجي جديد ✨'}
          </p>
        </div>
      </div>
    </div>
  )
}
