'use client'

import { Search, Filter } from 'lucide-react'

export default function OrdersFilter({ initialQ, initialStatus }: { initialQ: string, initialStatus: string }) {
  return (
    <form className="flex items-center gap-2" onChange={(e) => e.currentTarget.requestSubmit()}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input 
          name="q"
          defaultValue={initialQ}
          placeholder="رقم الفاتورة أو العميل..." 
          className="pl-4 pr-10 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 w-full sm:w-64"
        />
      </div>
      <div className="relative">
        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <select 
          name="status"
          defaultValue={initialStatus}
          className="pl-4 pr-10 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 appearance-none bg-white"
        >
          <option value="">كل الحالات</option>
          <option value="pending">قيد المراجعة</option>
          <option value="confirmed">تم التأكيد</option>
          <option value="processing">جاري التجهيز</option>
          <option value="shipped">في الطريق</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>
      <noscript>
        <button type="submit" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white">بحث</button>
      </noscript>
    </form>
  )
}
