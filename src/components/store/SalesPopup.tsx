'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function SalesPopup({ storeId }: { storeId: string }) {
  const [recentSales, setRecentSales] = useState<any[]>([])
  const [currentSale, setCurrentSale] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRecentSales() {
      const { data } = await supabase
        .from('orders')
        .select('customer_name, customer_address, created_at, order_items')
        .eq('store_id', storeId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (data && data.length > 0) {
        setRecentSales(data)
      }
    }
    fetchRecentSales()
  }, [storeId])

  useEffect(() => {
    if (recentSales.length === 0) return

    const showNextSale = () => {
      const randomIndex = Math.floor(Math.random() * recentSales.length)
      const sale = recentSales[randomIndex]
      setCurrentSale(sale)
      setIsVisible(true)

      // Hide after 5 seconds
      setTimeout(() => setIsVisible(false), 5000)
    }

    // Initial delay
    const initialDelay = setTimeout(showNextSale, 10000)
    
    // Interval every 25-40 seconds
    const interval = setInterval(showNextSale, 30000 + Math.random() * 15000)

    return () => {
      clearTimeout(initialDelay)
      clearInterval(interval)
    }
  }, [recentSales])

  if (!currentSale || !isVisible) return null

  const productName = currentSale.order_items?.[0]?.name || 'منتج مميز'
  const city = currentSale.customer_address?.split('-')[0]?.trim() || 'القاهرة'
  const name = currentSale.customer_name?.split(' ')[0] || 'عميل'

  return (
    <div className="fixed bottom-6 right-6 z-[999] animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="bg-white/90 backdrop-blur-md border border-zinc-100 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm group">
        <div className="h-12 w-12 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[var(--primary)]/20 group-hover:scale-110 transition-transform">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">طلب جديد مؤكد! 🔥</p>
          <p className="text-xs font-bold text-zinc-900 leading-tight">
            قام <span className="text-[var(--primary)]">{name}</span> من {city} بشراء {productName}
          </p>
          <p className="text-[9px] font-medium text-zinc-400">منذ قليل</p>
        </div>
        <button onClick={() => setIsVisible(false)} className="absolute -top-2 -left-2 bg-white border border-zinc-100 p-1 rounded-full shadow-md hover:bg-zinc-50 transition-colors">
          <X className="h-3 w-3 text-zinc-400" />
        </button>
      </div>
    </div>
  )
}
