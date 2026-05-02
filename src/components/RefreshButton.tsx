'use client'

import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function RefreshButton() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="تحديث القائمة"
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 active:scale-95 disabled:opacity-50"
    >
      <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
    </button>
  )
}
