import Link from 'next/link'
import { Store, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center px-4" dir="rtl">
      {/* Platform Icon */}
      <div className="mb-12 relative group">
        <div className="absolute -inset-4 bg-sky-100/50 rounded-full blur-2xl group-hover:bg-sky-200/50 transition-all duration-500" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-sky-100 border-4 border-white shadow-xl">
          <Store className="h-12 w-12 text-sky-600" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-8xl font-black text-sky-600/10 absolute -translate-y-24 left-1/2 -translate-x-1/2 select-none">404</h1>
        <h2 className="text-3xl font-black text-zinc-900 relative">الصفحة غير موجودة</h2>
        <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-12">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-zinc-200 hover:bg-zinc-800 hover:-translate-y-1 transition-all active:scale-95"
        >
          <Home className="h-5 w-5" />
          العودة للرئيسية
        </Link>
      </div>

      {/* Decorative background element */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sky-50/50 to-transparent pointer-events-none" />
    </div>
  )
}
