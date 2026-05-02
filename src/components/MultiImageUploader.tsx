'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ImagePlus, X, Loader2, Star } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface MultiImageUploaderProps {
  onImagesChange: (urls: string[]) => void
  defaultImages?: string[]
}

export default function MultiImageUploader({ onImagesChange, defaultImages = [] }: MultiImageUploaderProps) {
  const [images, setImages] = useState<string[]>(defaultImages)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`الملف "${file.name}" كبير جداً. الحد الأقصى 5MB.`)
      return null
    }
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) { console.error(error); return null }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return publicUrl
  }

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    if (images.length + files.length > 6) {
      toast.error('الحد الأقصى 6 صور لكل منتج.')
      return
    }
    setUploading(true)
    const uploaded: string[] = []
    for (const file of files) {
      const url = await uploadFile(file)
      if (url) uploaded.push(url)
    }
    const newImages = [...images, ...uploaded]
    setImages(newImages)
    onImagesChange(newImages)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  const setMainImage = (index: number) => {
    if (index === 0) return
    const newImages = [images[index], ...images.filter((_, i) => i !== index)]
    setImages(newImages)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Uploaded images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-rose-100 bg-rose-50 shadow-sm transition-all hover:shadow-md">
              <Image src={url} alt={`صورة ${index + 1}`} fill className="object-cover" />
              
              {/* Main badge */}
              {index === 0 && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-[10px] font-black text-white shadow-lg">
                  <Star className="h-3 w-3 fill-white" />
                  الأساسية
                </div>
              )}

              {/* Action buttons overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => setMainImage(index)}
                    className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors shadow-xl"
                  >
                    جعلها أساسية
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-xl"
                  title="حذف الصورة"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more slot */}
          {images.length < 6 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-50 group"
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-rose-100 transition-colors">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold">إضافة المزيد</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Initial upload zone */}
      {images.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-16 hover:border-rose-400 hover:bg-rose-50 transition-all group"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-rose-500" />
              <p className="text-sm font-bold text-zinc-500">جارٍ الرفع...</p>
            </div>
          ) : (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 group-hover:scale-110 transition-transform duration-300">
                <ImagePlus className="h-10 w-10 text-rose-500" />
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-zinc-800">اضغط لرفع صور المنتج</p>
                <p className="mt-2 text-sm text-zinc-500">يمكنك اختيار عدة صور معاً (بحد أقصى 6)</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="rounded-md bg-zinc-200 px-2 py-1 text-[10px] font-bold text-zinc-600 uppercase">PNG</span>
                  <span className="rounded-md bg-zinc-200 px-2 py-1 text-[10px] font-bold text-zinc-600 uppercase">JPG</span>
                  <span className="rounded-md bg-zinc-200 px-2 py-1 text-[10px] font-bold text-zinc-600 uppercase">WEBP</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        className="hidden"
      />

      <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-amber-700">
        <div className="h-2 w-2 rounded-full bg-amber-500" />
        <p className="text-[11px] font-bold">
          نصيحة: الصورة الأولى هي التي ستظهر في واجهة المتجر الرئيسية. يمكنك سحب وإفلات الملفات أو اختيارها دفعة واحدة.
        </p>
      </div>
    </div>
  )
}
