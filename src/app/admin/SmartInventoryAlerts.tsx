'use client'

import { useState } from 'react'
import { AlertTriangle, PackageX, Plus, Minus, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { updateStock, toggleProductVisibility } from './actions'
import toast from 'react-hot-toast'

export default function SmartInventoryAlerts({ products }: { products: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  const lowStockProducts = products
    .filter(p => p.stock !== null && p.stock < 5)
    .sort((a, b) => (a.stock || 0) - (b.stock || 0))

  if (lowStockProducts.length === 0) return null

  const handleUpdateStock = async (id: string, currentStock: number, delta: number) => {
    setLoadingId(id)
    const newStock = Math.max(0, currentStock + delta)
    const res = await updateStock(id, newStock)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('تم تحديث المخزون')
    }
    setLoadingId(null)
  }

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    setLoadingId(id)
    const res = await toggleProductVisibility(id, !currentVisibility)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(currentVisibility ? 'تم إخفاء المنتج' : 'تم إظهار المنتج')
    }
    setLoadingId(null)
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 shadow-sm">
            <AlertTriangle className="h-6 w-6 animate-pulse" strokeWidth={2.5} />
          </div>
          <div className="text-right">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">إدارة المخزون الذكية</h3>
            <p className="text-slate-500 font-bold text-xs mt-0.5">اتخذ إجراءً سريعاً للمنتجات التي أوشكت على النفاذ.</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {lowStockProducts.map(product => (
          <div 
            key={product.id} 
            className={`bg-white rounded-3xl border p-5 shadow-sm transition-all flex flex-col gap-4 relative group ${
              product.stock === 0 ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100'
            }`}
          >
            {loadingId === product.id && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 rounded-3xl flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-inner">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-50">
                    <PackageX className="h-6 w-6 text-slate-300" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-black text-slate-900 truncate">{product.name}</span>
                <span className={`text-[11px] font-black mt-1 flex items-center gap-2 ${
                  product.stock === 0 ? 'text-rose-600' : 'text-amber-600'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${product.stock === 0 ? 'bg-rose-600' : 'bg-amber-500 animate-pulse'}`}></span>
                  {product.stock === 0 ? 'نفدت الكمية تماماً' : `متبقي ${product.stock} قطع فقط`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <button 
                  onClick={() => handleUpdateStock(product.id, product.stock, -1)}
                  className="h-8 w-8 flex items-center justify-center bg-white text-slate-400 hover:text-rose-500 rounded-lg shadow-sm border border-slate-100 transition-all active:scale-90"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-black text-slate-700">{product.stock}</span>
                <button 
                  onClick={() => handleUpdateStock(product.id, product.stock, 1)}
                  className="h-8 w-8 flex items-center justify-center bg-white text-slate-400 hover:text-emerald-500 rounded-lg shadow-sm border border-slate-100 transition-all active:scale-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggleVisibility(product.id, product.is_visible)}
                  title={product.is_visible ? 'إخفاء المنتج عن العملاء' : 'إظهار المنتج للعملاء'}
                  className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-90 ${
                    product.is_visible ? 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50' : 'bg-rose-500 border border-rose-400 text-white shadow-rose-200'
                  }`}
                >
                  <EyeOff className="h-4.5 w-4.5" />
                </button>
                <Link 
                  href={`/admin/products/${product.id}/edit`}
                  className="h-11 px-5 flex items-center justify-center bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-125 transition-all shadow-md active:scale-95"
                >
                  تعديل
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
