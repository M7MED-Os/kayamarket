'use client'

import Link from 'next/link'
import { ShoppingBag, Heart, MessageSquare, Package, Truck } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import Image from 'next/image'

interface StoreHeaderProps {
  store: any
  branding: any
  slug: string
}

export default function StoreHeader({ store, branding, slug }: StoreHeaderProps) {
  const settings = branding?.header_settings || { layout: 'left', sticky: true, showCart: true }
  const logoSrc = branding?.logo_url || null
  const isCentered = settings.layout === 'center'

  const { totalItems: cartCount } = useCart()
  const { totalItems: wishlistCount } = useWishlist()

  const primaryColor = branding?.primary_color || '#e11d48'

  return (
    <header className={`${settings.sticky ? 'sticky top-0' : ''} z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-100 shadow-sm`}>
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-6 py-4 ${isCentered ? 'flex-col gap-4' : ''}`}>
        <Link href={`/store/${slug}`} className="flex items-center gap-3">
          {logoSrc ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-zinc-100">
              <img src={logoSrc} alt={store.name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <span className="text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>
              {store.name}
            </span>
          )}
          {logoSrc && <span className="text-lg font-black text-zinc-900 tracking-tight">{store.name}</span>}
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-black text-zinc-500 ml-4">
            <Link href={`/store/${slug}/products`} className="hover:text-zinc-900 transition-colors">المنتجات</Link>
            <Link href={`/store/${slug}/track`} className="hover:text-zinc-900 transition-colors flex items-center gap-1"><Truck className="h-4 w-4" /> تتبع طلبك</Link>
            <a href={`/store/${slug}#contact`} className="hover:text-zinc-900 transition-colors">تواصل معنا</a>
          </nav>

          <div className="flex items-center gap-2">
            {/* Track Order Icon (Mobile) */}
            <Link
              href={`/store/${slug}/track`}
              className="md:hidden h-10 w-10 flex items-center justify-center rounded-full bg-zinc-50 hover:bg-zinc-100 transition-colors"
              title="تتبع طلبك"
            >
              <Truck className="h-5 w-5 text-zinc-600" />
            </Link>

            {/* Mobile Products Icon */}
            <Link
              href={`/store/${slug}/products`}
              className="md:hidden h-10 w-10 flex items-center justify-center rounded-full bg-zinc-50 hover:bg-zinc-100 transition-colors"
              title="المنتجات"
            >
              <Package className="h-5 w-5 text-zinc-600" />
            </Link>

            {/* Wishlist Icon */}
            <Link
              href={`/store/${slug}/wishlist`}
              className="relative h-10 w-10 flex items-center justify-center rounded-full bg-zinc-50 hover:bg-zinc-100 transition-colors group"
            >
              <Heart className={`h-5 w-5 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-zinc-600'}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            {settings.showCart !== false && (
              <Link
                href={`/store/${slug}/cart`}
                className="relative h-10 w-10 flex items-center justify-center rounded-full bg-zinc-50 hover:bg-zinc-100 transition-colors group"
              >
                <ShoppingBag className="h-5 w-5 text-zinc-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
