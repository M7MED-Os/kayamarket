'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // يمكن هنا ربط الخطأ بخدمات التتبع مثل Sentry لو أردت مستقبلاً
    console.error('تم رصد خطأ بواسطة جدار الحماية:', error)
  }, [error])

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-50 p-4 text-center font-[family-name:var(--font-cairo)]" dir="rtl">
      <div className="flex w-full max-w-md flex-col items-center rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 rounded-full bg-red-100 p-4 text-red-600">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h2 className="mb-2 text-2xl font-black text-zinc-900">عذراً، حدث خطأ غير متوقع!</h2>
        <p className="mb-8 text-sm text-zinc-500 leading-relaxed">
          يبدو أن هناك مشكلة فنية قد حدثت أثناء جلب البيانات أو تحميل الصفحة. لا تقلق، يمكنك المحاولة مرة أخرى أو العودة بأمان للصفحة الرئيسية.
        </p>
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            onClick={() => reset()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
          >
            <RefreshCcw className="h-4 w-4" />
            المحاولة مرة أخرى
          </button>
          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
          >
            <Home className="h-4 w-4" />
            الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
