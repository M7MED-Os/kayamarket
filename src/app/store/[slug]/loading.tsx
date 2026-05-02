import { Loader2 } from 'lucide-react'

export default function StoreLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6" dir="rtl">
      {/* Modern Skeleton Layout for Storefront */}
      <div className="w-full max-w-6xl space-y-12 opacity-60 pointer-events-none">
        
        {/* Hero Skeleton */}
        <div className="w-full h-[400px] md:h-[500px] bg-slate-100 rounded-[3rem] animate-pulse relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>

        {/* Features Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>

        {/* Products Grid Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-8">
             <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
             <div className="h-8 w-24 bg-slate-50 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex flex-col gap-4">
                <div className="aspect-[4/5] bg-slate-100 rounded-3xl animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-slate-100 rounded-md animate-pulse" />
                  <div className="h-4 w-1/2 bg-slate-50 rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
