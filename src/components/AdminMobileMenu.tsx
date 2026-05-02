'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LayoutDashboard, PlusCircle, Ticket, ClipboardList, Settings } from 'lucide-react'

export default function AdminMobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-zinc-600 hover:text-rose-600 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-zinc-200 bg-white p-4 shadow-lg z-50">
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/products/new"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
                Add Product
              </Link>
            </li>
            <li>
              <Link
                href="/admin/coupons"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <Ticket className="h-5 w-5" />
                Coupons
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <ClipboardList className="h-5 w-5" />
                Orders
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
