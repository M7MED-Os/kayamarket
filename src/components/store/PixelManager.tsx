'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

interface PixelManagerProps {
  fbPixelId?: string
  tiktokPixelId?: string
  googleAnalyticsId?: string
}

// Global helper to track events from anywhere
export const trackPixelEvent = (eventName: string, params?: any) => {
  if (typeof window === 'undefined') return

  // Facebook
  if ((window as any).fbq) {
    (window as any).fbq('track', eventName, params)
  }

  // TikTok
  if ((window as any).ttq) {
    (window as any).ttq.track(eventName, params)
  }

  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, params)
  }
}

export const trackAddToCart = (product: any) => {
  trackPixelEvent('AddToCart', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'EGP'
  })
}

export const trackPurchase = (order: any) => {
  trackPixelEvent('Purchase', {
    content_ids: [order.id],
    content_type: 'product',
    value: order.final_price || order.product_price,
    currency: 'EGP'
  })
}

export default function PixelManager({ fbPixelId, tiktokPixelId, googleAnalyticsId }: PixelManagerProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (!fbPixelId && !tiktokPixelId && !googleAnalyticsId) return

    // Track PageView on route change
    if (fbPixelId && (window as any).fbq) {
      (window as any).fbq('track', 'PageView')
    }

    if (tiktokPixelId && (window as any).ttq) {
      (window as any).ttq.page()
    }
  }, [pathname, fbPixelId, tiktokPixelId, googleAnalyticsId])

  return (
    <>
      {/* --- Meta Pixel (Facebook) --- */}
      {fbPixelId && (
        <>
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* --- TikTok Pixel --- */}
      {tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndLog=function(t,e){return function(){t.set(e,arguments[0]),t.log(e,arguments[0])}};for(var i=0;i<ttq.methods.length;i++)ttq[ttq.methods[i]]=ttq.setAndLog(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)e[ttq.methods[n]]=ttq.setAndLog(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {/* --- Google Analytics --- */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `}
          </Script>
        </>
      )}
    </>
  )
}
