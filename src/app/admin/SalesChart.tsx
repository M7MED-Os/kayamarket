'use client'

import { useState } from 'react'
import { TrendingUp, CalendarDays } from 'lucide-react'

type SalesData = {
  sale_date: string
  total_revenue: string | number
  orders_count: string | number
}

export default function SalesChart({ data }: { data: SalesData[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Parse and normalize data
  const normalizedData = data.map(d => ({
    ...d,
    total_revenue: Number(d.total_revenue),
    orders_count: Number(d.orders_count)
  }))

  const maxRevenue = Math.max(...normalizedData.map(d => d.total_revenue), 1) // Prevent division by zero

  const totalPeriodRevenue = normalizedData.reduce((acc, curr) => acc + curr.total_revenue, 0)

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-1.5 bg-sky-500 rounded-full" />
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">أداء المبيعات</h3>
          </div>
          <p className="text-slate-400 font-bold text-xs">نظرة عامة على الإيرادات لآخر {data.length} أيام</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجمالي</span>
            <span className="text-lg font-black text-slate-900">{totalPeriodRevenue.toLocaleString()} ج.م</span>
          </div>
          <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* SVG Responsive Bar Chart */}
      <div className="relative h-64 w-full flex items-end justify-between gap-1 sm:gap-2 mt-4 pt-4 border-b border-slate-100 pb-2">
        {normalizedData.map((day, i) => {
          const heightPercent = (day.total_revenue / maxRevenue) * 100
          
          return (
            <div 
              key={i} 
              className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              <div className={`absolute -top-12 z-10 whitespace-nowrap bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 pointer-events-none shadow-xl ${hoveredIndex === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <div className="flex flex-col items-center gap-1">
                  <span>{day.total_revenue.toLocaleString()} ج.م</span>
                  <span className="text-[9px] text-slate-400">{new Date(day.sale_date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}</span>
                </div>
                {/* Tooltip arrow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>

              {/* Bar */}
              <div 
                className="w-full bg-sky-100 rounded-t-lg transition-all duration-500 ease-out group-hover:bg-sky-400 relative overflow-hidden"
                style={{ height: `${Math.max(heightPercent, 2)}%` }} // Minimum 2% height so it's visible even on 0 sales
              >
                {/* Inner gradient/highlight */}
                <div className={`absolute inset-0 bg-gradient-to-t from-sky-500 to-sky-400 transition-opacity duration-300 ${hoveredIndex === i ? 'opacity-100' : 'opacity-0'}`} />
              </div>

              {/* X-Axis Label (show every nth item on mobile, or all on desktop) */}
              <span className={`absolute -bottom-6 text-[9px] sm:text-[10px] font-bold text-slate-400 whitespace-nowrap truncate w-full text-center ${i % 2 !== 0 ? 'hidden sm:block' : 'block'}`}>
                {new Date(day.sale_date).getDate()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
