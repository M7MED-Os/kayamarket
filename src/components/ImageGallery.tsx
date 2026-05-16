import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronRight, ChevronLeft, ImageOff, X, Maximize2 } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  productName: string
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  const validImages = images.filter(Boolean)

  // Disable scroll when fullscreen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isFullScreen])

  if (validImages.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-zinc-50 border border-zinc-200">
        <ImageOff className="h-24 w-24 text-zinc-200" />
      </div>
    )
  }

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveIndex(i => (i - 1 + validImages.length) % validImages.length)
  }
  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveIndex(i => (i + 1) % validImages.length)
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div 
        className="relative aspect-square cursor-zoom-in group overflow-hidden rounded-2xl md:rounded-[2rem] bg-zinc-50 border border-zinc-100 shadow-xl"
        onClick={() => setIsFullScreen(true)}
      >
        <Image
          key={validImages[activeIndex]}
          src={validImages[activeIndex]}
          alt={`${productName} - صورة ${activeIndex + 1}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority
        />

        {/* Zoom Indicator Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 border border-zinc-100">
            <Maximize2 className="h-5 w-5 text-zinc-900" />
          </div>
        </div>

        {/* Persistent Indicator (Visible on all devices) */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full border border-zinc-200 flex items-center gap-2 shadow-2xl z-10 animate-pulse">
          <Maximize2 className="h-3.5 w-3.5 text-zinc-900" />
          <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">اضغط للتكبير</span>
        </div>

        {/* Navigation arrows — only show if more than 1 image */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white transition-all hover:scale-110 z-10"
            >
              <ChevronRight className="h-6 w-6 text-zinc-700" />
            </button>
            <button
              onClick={next}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white transition-all hover:scale-110 z-10"
            >
              <ChevronLeft className="h-6 w-6 text-zinc-700" />
            </button>
            {/* Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm z-10">
              {activeIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {validImages.map((url, index) => (
            <button
              key={url}
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                index === activeIndex
                  ? 'border-zinc-900 shadow-md scale-105 z-10'
                  : 'border-zinc-100 opacity-60 hover:opacity-100 hover:border-zinc-300'
              }`}
            >
              <Image src={url} alt={`مصغر ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox using Portal */}
      {isFullScreen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[2147483647] bg-zinc-950/70 backdrop-blur-md flex flex-col items-center justify-between animate-in fade-in duration-500"
          onClick={() => setIsFullScreen(false)}
        >
          {/* Top Bar with Close Button */}
          <div className="w-full flex justify-end p-6 md:p-8">
            <button 
              className="group h-12 w-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 shadow-2xl active:scale-90"
              onClick={() => setIsFullScreen(false)}
            >
              <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
            </button>
          </div>

          {/* Main Image Viewport */}
          <div className="relative w-full flex-1 flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center pointer-events-none" onClick={e => e.stopPropagation()}>
              <img 
                src={validImages[activeIndex]} 
                alt={productName}
                className="max-w-full max-h-full w-auto h-auto object-contain shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 pointer-events-auto rounded-sm"
              />
            </div>

            {/* Floating Navigation Arrows */}
            {validImages.length > 1 && (
              <>
                <button 
                  className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-[2147483648] h-14 w-14 md:h-20 md:w-20 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/5 hover:bg-white hover:text-black transition-all duration-500 active:scale-90 shadow-2xl group"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                >
                  <ChevronLeft className="h-8 w-8 md:h-10 md:w-10 transition-transform group-hover:-translate-x-1" />
                </button>
                <button 
                  className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-[2147483648] h-14 w-14 md:h-20 md:w-20 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/5 hover:bg-white hover:text-black transition-all duration-500 active:scale-90 shadow-2xl group"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                >
                  <ChevronRight className="h-8 w-8 md:h-10 md:w-10 transition-transform group-hover:translate-x-1" />
                </button>
              </>
            )}
          </div>

          {/* Minimal Thumbnails Bar */}
          {validImages.length > 1 && (
            <div className="w-full flex justify-center p-8 pb-10" onClick={e => e.stopPropagation()}>
              <div className="bg-black/40 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white/5 flex gap-4 overflow-x-auto scrollbar-hide shadow-2xl">
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative h-14 w-14 md:h-20 md:w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-500 ${activeIndex === idx ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
