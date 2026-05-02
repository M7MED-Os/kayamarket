'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 border-y border-rose-100 bg-white px-4 py-4 shadow-xl">
          <ul className="flex flex-col gap-4 text-center text-base font-bold text-zinc-600">
            <li>
              <Link
                href="/#products"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl bg-rose-50 py-3 hover:bg-rose-100 hover:text-rose-600 transition-colors"
              >
                منتجاتنا
              </Link>
            </li>
            <li>
              <Link
                href="/#features"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl bg-rose-50 py-3 hover:bg-rose-100 hover:text-rose-600 transition-colors"
              >
                لماذا نحن
              </Link>
            </li>
            <li>
              <Link
                href="/#contact"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl bg-rose-50 py-3 hover:bg-rose-100 hover:text-rose-600 transition-colors"
              >
                اتصل بنا
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
