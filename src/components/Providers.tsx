'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider>
      <CartProvider>
        {children}
        <ProgressBar
          height="4px"
          color="#e11d48"
          options={{ showSpinner: false }}
          shallowRouting
        />
      </CartProvider>
    </WishlistProvider>
  )
}
