import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="min-h-[80vh] w-full p-4 md:p-8 animate-in fade-in duration-500" dir="rtl">
      
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-slate-100 rounded-md animate-pulse" />
        </div>
        <div className="h-12 w-32 bg-slate-100 rounded-xl animate-pulse hidden md:block" />
      </div>

      {/* Main Content Skeleton */}
      <div className="space-y-6">
        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="h-4 w-20 bg-slate-100 rounded-md animate-pulse" />
                <div className="h-10 w-10 bg-slate-50 rounded-xl animate-pulse" />
              </div>
              <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          ))}
        </div>

        {/* Large Chart/Table Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
            <div className="h-6 w-40 bg-slate-200 rounded-md animate-pulse mb-8" />
            <div className="space-y-4">
               {[1, 2, 3, 4, 5].map(i => (
                 <div key={i} className="h-12 w-full bg-slate-50 rounded-xl animate-pulse" />
               ))}
            </div>
          </div>
          <div className="h-[400px] bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
            <div className="h-6 w-32 bg-slate-200 rounded-md animate-pulse mb-8" />
            <div className="space-y-4 flex flex-col items-center justify-center h-full pb-10">
               <div className="h-32 w-32 rounded-full border-8 border-slate-50 animate-pulse" />
               <div className="h-4 w-24 bg-slate-100 rounded-md animate-pulse mt-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Center Loader */}
      <div className="fixed bottom-10 left-10 md:left-1/2 md:-translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-bounce">
        <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
        <span className="text-xs font-black tracking-widest">جاري التحميل...</span>
      </div>
    </div>
  )
}
