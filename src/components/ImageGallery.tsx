'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronRight, ChevronLeft, ImageOff } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  productName: string
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const validImages = images.filter(Boolean)

  if (validImages.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-zinc-50 border border-zinc-200">
        <ImageOff className="h-24 w-24 text-zinc-200" />
      </div>
    )
  }

  const prev = () => setActiveIndex(i => (i - 1 + validImages.length) % validImages.length)
  const next = () => setActiveIndex(i => (i + 1) % validImages.length)

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-zinc-50 shadow-xl border border-zinc-100">
        <Image
          key={validImages[activeIndex]}
          src={validImages[activeIndex]}
          alt={`${productName} - صورة ${activeIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          priority
        />

        {/* Navigation arrows — only show if more than 1 image */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white transition-all hover:scale-105"
            >
              <ChevronRight className="h-5 w-5 text-zinc-700" />
            </button>
            <button
              onClick={next}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white transition-all hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5 text-zinc-700" />
            </button>
            {/* Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {activeIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>
      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((url, index) => (
            <button
              key={url}
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                index === activeIndex
                  ? 'border-zinc-900 shadow-md shadow-zinc-200 scale-105'
                  : 'border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={url} alt={`مصغر ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
