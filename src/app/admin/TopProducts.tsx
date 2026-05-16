'use client'

import { Trophy } from 'lucide-react'

type TopProduct = {
  product_id: string
  product_name: string
  total_sales: string | number
  orders_count: string | number
}

export default function TopProducts({ data }: { data: TopProduct[] }) {
  if (!data || data.length === 0) return null

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden w-full">
      <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-gradient-to-l from-amber-50/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
            <Trophy className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="text-right">
            <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">الأكثر مبيعاً</h3>
            <p className="text-slate-400 font-bold text-[10px] md:text-xs">المنتجات التي تحقق أعلى إيرادات.</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col divide-y divide-slate-50">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-slate-50/50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right flex-1">المنتج</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16 md:w-20">المبيعات</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left w-20 md:w-24">الإيرادات</span>
        </div>
        
        {data.map((product, idx) => (
          <div key={product.product_id} className="flex items-center justify-between px-4 md:px-6 py-5 hover:bg-slate-50/50 transition-colors group">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 pr-2">
              <div className="h-7 w-7 md:h-8 md:w-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-[9px] md:text-[10px] font-black text-slate-400">
                #{idx + 1}
              </div>
              <p className="text-xs md:text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors truncate" title={product.product_name}>
                {product.product_name}
              </p>
            </div>
            
            <div className="w-16 md:w-20 text-center shrink-0">
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-black bg-sky-50 text-sky-600 border border-sky-100">
                {product.orders_count} طلب
              </span>
            </div>
            
            <div className="w-20 md:w-24 text-left shrink-0 pl-1">
              <span className="text-xs md:text-sm font-black text-emerald-600">
                {Number(product.total_sales).toLocaleString()} <span className="text-[10px] font-bold opacity-70">ج.م</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
