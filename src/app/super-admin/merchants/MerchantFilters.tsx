'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export default function MerchantFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')

  const currentPlan = searchParams.get('plan') || 'all'

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateFilters('q', searchValue)
    }, 500)
    return () => clearTimeout(timeout)
  }, [searchValue])

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    startTransition(() => {
      router.push(`/super-admin/merchants?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className={`bg-white border border-slate-200 p-4 rounded-[1.5rem] shadow-sm flex flex-col md:flex-row gap-4 ${isPending ? 'opacity-70' : ''} transition-opacity`}>
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="البحث باسم المتجر..." 
          className="w-full h-12 bg-slate-50 border-none rounded-xl pr-12 text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all" 
        />
      </div>

      {/* Plan Filters - Unified to starter/growth/pro */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'starter', label: 'Free' },
          { id: 'growth', label: 'Pro' },
          { id: 'pro', label: 'Pro Plus' }
        ].map(p => (
          <button 
            key={p.id} 
            onClick={() => updateFilters('plan', p.id)}
            className={`px-6 h-12 rounded-xl text-sm font-black transition-all ${currentPlan === p.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
