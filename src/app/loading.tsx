import { Loader2, PackageSearch } from 'lucide-react'

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6" dir="rtl">
      
      {/* Brand Icon Animation */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-slate-900/5 rounded-3xl animate-ping" style={{ animationDuration: '3s' }} />
        <div className="relative h-24 w-24 bg-white shadow-2xl shadow-slate-200/50 rounded-3xl flex items-center justify-center border border-slate-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent" />
          <div className="w-12 h-12 bg-slate-50 rounded-2xl animate-pulse flex items-center justify-center z-10 border border-slate-100 shadow-inner">
            <PackageSearch className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-3 mb-16">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">KayaMarket</h2>
        <div className="flex items-center justify-center gap-2">
           <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
           <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">جاري التجهيز</p>
        </div>
      </div>

      {/* Generic UI Skeleton */}
      <div className="w-full max-w-4xl space-y-6 opacity-40 pointer-events-none">
        
        {/* Top bar */}
        <div className="w-full h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-between px-6 shadow-sm">
           <div className="h-4 w-32 bg-slate-100 rounded-md animate-pulse" />
           <div className="flex gap-2">
              <div className="h-8 w-8 bg-slate-50 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-slate-50 rounded-full animate-pulse" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="h-[300px] bg-white border border-slate-100 rounded-[2rem] shadow-sm animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/30 to-slate-100/20 -translate-x-full animate-[shimmer_2s_infinite]" />
           </div>
           <div className="md:col-span-2 h-[300px] bg-white border border-slate-100 rounded-[2rem] shadow-sm animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/50 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
           </div>
        </div>
        
      </div>
    </div>
  )
}
