'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { updateOrderStatus, deleteOrder } from '@/app/actions/order'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { 
  Eye, Clock, CheckCircle, PackageCheck, XCircle, ChevronRight, ChevronLeft, 
  Trash2, CreditCard, AlertTriangle, RefreshCw, BellRing, Edit2, Package, Check,
  Phone, User, Calendar, MoreVertical, Hash, Receipt, Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PlanTier, PLAN_CONFIG, getPlanConfig } from '@/lib/subscription'

const STATUS_MAP: Record<string, { label: string; icon: any; bg: string; text: string; border: string }> = {
  pending: { label: 'جديد', icon: Clock, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  confirmed: { label: 'تأكيد', icon: CheckCircle, bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
  processing: { label: 'تجهيز', icon: Package, bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  delivered: { label: 'تم التوصيل', icon: PackageCheck, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  paid: { label: 'تم الدفع', icon: CreditCard, bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' },
  cancelled: { label: 'ملغي', icon: XCircle, bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  abandoned: { label: 'سلة مهجورة', icon: AlertTriangle, bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200' },
}

const PAYMENT_MAP: Record<string, string> = {
  cash: 'كاش',
  online: 'إلكتروني',
  deposit: 'عربون',
  'الدفع عند الاستلام': 'كاش',
  'الدفع عند الاستلام (عربون)': 'عربون',
  'تحويل بنكي / محافظ إلكترونية': 'محفظة',
}

interface OrderTableProps {
  orders: any[]
  currentPage: number
  totalPages: number
  totalCount: number
  storeId: string
  storeName: string
  plan?: PlanTier
}

export default function OrderTable({ orders, currentPage, totalPages, totalCount, storeId, storeName, plan = 'starter' }: OrderTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [notificationSound, setNotificationSound] = useState('/sounds/new-notification-027.mp3')
  const [activeStatusOrderId, setActiveStatusOrderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const audioEnabledRef = useRef(isAudioEnabled)
  const soundUrlRef = useRef(notificationSound)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    audioEnabledRef.current = isAudioEnabled
    soundUrlRef.current = notificationSound
  }, [isAudioEnabled, notificationSound])

  useEffect(() => {
    const savedSound = localStorage.getItem('order-notification-sound')
    if (savedSound) setNotificationSound(savedSound)
  }, [])

  const handleSoundChange = (url: string) => {
    setNotificationSound(url)
    localStorage.setItem('order-notification-sound', url)
    const audio = new Audio(url)
    audio.play().catch(() => { })
  }

  const SOUND_OPTIONS = [
    { name: 'إشعار 027', url: '/sounds/new-notification-027.mp3' },
    { name: 'إشعار 018', url: '/sounds/new-notification-018.mp3' },
    { name: 'إشعار 012', url: '/sounds/new-notification-012.mp3' },
    { name: 'إشعار 017', url: '/sounds/new-notification-017.mp3' },
    { name: 'إشعار 034', url: '/sounds/new-notification-034.mp3' },
    { name: 'إشعار 05', url: '/sounds/new-notification-05.mp3' },
    { name: 'تنبيه مشرق', url: '/sounds/bright-notification.mp3' },
    { name: 'رسالة سعيدة', url: '/sounds/happy-message-ping.mp3' },
    { name: 'أوليفيا باركر', url: '/sounds/olivia_parker-notification.mp3' },
    { name: 'تنبيه النظام', url: '/sounds/system-notification-02.mp3' },
  ]

  useEffect(() => {
    if (!storeId) return
    const channel = supabase
      .channel(`new-orders-${storeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `store_id=eq.${storeId}` }, () => {
        if (audioEnabledRef.current) {
          const audio = new Audio(soundUrlRef.current)
          audio.play().catch(() => { })
        }
        toast('طلب جديد وصل!', { icon: '🔔', duration: 6000 })
        router.refresh()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, storeId, router])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 800)
  }, [router])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setActiveStatusOrderId(null)
    setLoadingId(orderId)
    try {
      const res = await updateOrderStatus(orderId, newStatus)
      if (res.success) {
        toast.success('تم تحديث الحالة بنجاح')
        router.refresh()
      } else {
        toast.error(res.error || 'حدث خطأ')
      }
    } catch { toast.error('حدث خطأ') } finally { setLoadingId(null) }
  }

  const confirmDelete = async () => {
    if (!deleteCandidateId) return;
    setLoadingId(deleteCandidateId)
    try {
      const res = await deleteOrder(deleteCandidateId)
      if (res.success) {
        toast.success('تم حذف الطلب بنجاح')
        router.refresh()
      } else { toast.error(res.error || 'حدث خطأ') }
    } catch { toast.error('حدث خطأ') } finally {
      setLoadingId(null)
      setDeleteCandidateId(null)
    }
  }

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase()
    return (
      order.id.toLowerCase().includes(query) ||
      (order.customer_name || '').toLowerCase().includes(query) ||
      (order.customer_phone || '').includes(query)
    )
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Action Bar (Search & Settings) ────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث برقم الطلب، اسم العميل، أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pr-12 pl-4 rounded-2xl border border-slate-100 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-inter text-sm shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none flex items-center gap-2 bg-white border border-slate-100 p-2 rounded-2xl shadow-sm">
              <select
                value={notificationSound}
                onChange={(e) => handleSoundChange(e.target.value)}
                className="bg-transparent text-[10px] font-black text-slate-400 outline-none px-2 cursor-pointer"
              >
                {SOUND_OPTIONS.map(s => <option key={s.url} value={s.url}>{s.name}</option>)}
              </select>
              <button
                onClick={() => {
                  const newState = !isAudioEnabled;
                  setIsAudioEnabled(newState);
                  if (newState) {
                    const audio = new Audio(notificationSound);
                    audio.play().catch(() => { });
                  }
                }}
                className={`flex items-center justify-center p-2 rounded-xl transition-all ${isAudioEnabled ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'bg-slate-50 text-slate-400'}`}
              >
                <BellRing className={`h-4 w-4 ${isAudioEnabled ? 'animate-pulse' : 'opacity-50'}`} />
              </button>
            </div>

            <button onClick={handleRefresh} disabled={isRefreshing} className="px-5 h-12 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-slate-700 shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
          </div>
      </div>

      {/* ── Precise Grid System ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-6 md:gap-8">
        {filteredOrders.map((order) => {
          const statusObj = STATUS_MAP[order.status] || STATUS_MAP.pending
          const StatusIcon = statusObj.icon
          const paymentLabel = PAYMENT_MAP[order.payment_method] || order.payment_method || 'غير محدد'
          const isSelectorOpen = activeStatusOrderId === order.id
          const isProcessing = loadingId === order.id
          
          return (
            <div 
              key={order.id} 
              className={`bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-full hover:shadow-xl hover:border-sky-100 transition-all duration-300 group relative ${isSelectorOpen ? 'z-50' : 'z-0'} ${isProcessing ? 'opacity-50 pointer-events-none scale-95' : ''}`}
            >
              <div className="px-5 py-3 bg-slate-50/50 flex items-center justify-between border-b border-slate-100 rounded-t-3xl">
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                  <span className="text-sm font-black text-slate-900 font-poppins uppercase tracking-wider" dir="ltr">#{order.id.split('-')[0].toUpperCase()}</span>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStatusOrderId(isSelectorOpen ? null : order.id);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all ${statusObj.bg} ${statusObj.text} ${statusObj.border} shadow-sm active:scale-95`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusObj.label}
                  </button>

                  {isSelectorOpen && (
                    <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                       {Object.entries(STATUS_MAP).map(([key, val]) => (
                         <button
                           key={key}
                           onClick={(e) => {
                             e.stopPropagation();
                             handleStatusChange(order.id, key);
                           }}
                           className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[9px] font-black transition-all mb-1 last:mb-0 ${
                             order.status === key ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                           }`}
                         >
                            <span className="font-inter">{val.label}</span>
                            {order.status === key && <Check className="h-2.5 w-2.5" />}
                         </button>
                       ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 flex-grow space-y-4">
                 {/* Order Total Header */}
                 <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <div className="space-y-0.5">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">إجمالي الطلب</p>
                       <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-sky-600 font-poppins">{order.final_price.toLocaleString()}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">ج.م</span>
                       </div>
                    </div>
                    {order.order_items && order.order_items.length > 1 && (
                       <div className="bg-sky-50 text-sky-600 px-3 py-1 rounded-full text-[10px] font-black border border-sky-100">
                          {order.order_items.length} منتجات
                       </div>
                    )}
                 </div>

                 <div className="flex flex-col gap-4">
                   {(order.order_items && order.order_items.length > 0 ? order.order_items : [{ product_name: order.product_name, quantity: 1, product_price: order.product_price, variant_info: order.variant_info }]).map((item: any, idx: number) => (
                     <div key={idx} className="space-y-1">
                       <div className="flex items-start gap-3">
                         <span className="text-xs font-black text-sky-500 bg-sky-50 h-6 w-6 flex items-center justify-center rounded-lg shrink-0">{item.quantity}</span>
                         <h4 className="text-lg font-black text-slate-900 leading-tight font-inter line-clamp-2">{item.product_name}</h4>
                       </div>
                       {item.variant_info && (item.variant_info.color || item.variant_info.size) && (
                         <div className="flex flex-wrap gap-2 pr-9">
                           {item.variant_info.color && (
                             <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-600 rounded-lg border border-slate-200">
                               اللون: {item.variant_info.color}
                             </span>
                           )}
                           {item.variant_info.size && (
                             <span className="px-2 py-0.5 bg-sky-50 text-[9px] font-black text-sky-600 rounded-lg border border-sky-100">
                               المقاس: {item.variant_info.size}
                             </span>
                           )}
                         </div>
                       )}
                     </div>
                   ))}
                 </div>

                 <div className="grid grid-cols-2 gap-y-5 gap-x-10 py-6 border-y border-slate-50/80">
                   <div className="space-y-1.5">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest"><User className="h-3 w-3" /> العميل</div>
                     <p className="text-sm font-black text-slate-700 truncate">{order.customer_name}</p>
                   </div>
                   <div className="space-y-1.5">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest"><Phone className="h-3 w-3" /> التواصل</div>
                     <p className="text-sm font-black text-slate-700 text-right" dir="ltr">{order.customer_phone}</p>
                   </div>
                   <div className="space-y-1.5">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest"><Calendar className="h-3 w-3" /> التاريخ</div>
                     <p className="text-sm font-black text-slate-700">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                   </div>
                   <div className="space-y-1.5">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest"><CreditCard className="h-3 w-3" /> الدفع</div>
                     <p className="text-sm font-black text-slate-700">{paymentLabel}</p>
                   </div>
                 </div>
              </div>

              <div className="px-7 pb-7 flex items-center gap-4">
                {order.status === 'abandoned' ? (
                  <button
                    onClick={() => {
                      const msg = `أهلاً بك يا ${order.customer_name}، لاحظنا أنك بدأت طلبك من متجر ${storeName} ولكن لم تكمله. هل واجهتك أي مشكلة؟ نحن هنا للمساعدة!`;
                      const phone = order.customer_phone.startsWith('0') ? `2${order.customer_phone}` : order.customer_phone;
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-3 h-14 bg-emerald-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95"
                  >
                    <Phone className="h-5 w-5" />
                    استعادة عبر واتساب
                  </button>
                ) : (
                  <Link
                    href={`/invoice/${order.id}?token=${order.public_token}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-3 h-14 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-lg shadow-slate-100 hover:bg-sky-600 transition-all active:scale-95"
                  >
                    <Receipt className="h-5 w-5" />
                    عرض الفاتورة
                  </Link>
                )}
                <button
                  onClick={() => setDeleteCandidateId(order.id)}
                  className="h-14 w-14 flex items-center justify-center bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 font-inter">صفحة {currentPage} من {totalPages}</p>
          <div className="flex items-center gap-3">
             <Link href={`/admin/orders?page=${Math.max(1, currentPage - 1)}`} className={`p-3 rounded-xl border border-slate-100 bg-white ${currentPage === 1 ? 'opacity-30 pointer-events-none' : 'active:scale-90'}`}><ChevronRight className="h-5 w-5" /></Link>
             <Link href={`/admin/orders?page=${Math.min(totalPages, currentPage + 1)}`} className={`p-3 rounded-xl border border-slate-100 bg-white ${currentPage === totalPages ? 'opacity-30 pointer-events-none' : 'active:scale-90'}`}><ChevronLeft className="h-5 w-5" /></Link>
          </div>
        </div>
      )}

      {deleteCandidateId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl text-center space-y-6">
              <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
                 <AlertTriangle className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">حذف الطلب نهائياً؟</h3>
              <div className="flex items-center gap-3">
                 <button onClick={() => setDeleteCandidateId(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black">تراجع</button>
                 <button onClick={confirmDelete} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-xl shadow-rose-200">تأكيد الحذف</button>
              </div>
           </div>
        </div>
      )}

      {activeStatusOrderId && <div className="fixed inset-0 z-40" onClick={() => setActiveStatusOrderId(null)} />}
    </div>
  )
}
