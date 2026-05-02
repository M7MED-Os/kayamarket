'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PackageX } from 'lucide-react'

interface ProductImageProps {
  src: string | null
  alt: string
  className?: string
}

export default function ProductImage({ src, alt, className = 'object-cover' }: ProductImageProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="absolute inset-0 bg-zinc-100 flex items-center justify-center">
        <PackageX className="h-10 w-10 text-zinc-300" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      className={className}
      onError={() => setError(true)}
    />
  )
}
