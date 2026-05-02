'use client'

import { useState, useRef } from 'react'
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadImage } from '@/app/actions/storage'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  category: 'products' | 'logos' | 'banners'
  currentUrl?: string | null
  onUploadSuccess: (url: string) => void
  onFileSelect?: (file: File) => void // New: for manual mode
  variant?: 'default' | 'compact' // New: for UI style
  mode?: 'auto' | 'manual' // New: auto uploads immediately, manual returns File
}

export default function ImageUpload({ 
  category, 
  currentUrl, 
  onUploadSuccess, 
  onFileSelect,
  variant = 'default',
  mode = 'auto'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('يجب اختيار ملف صورة فقط')
      return
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم الصورة يجب ألا يتجاوز 2 ميجابايت')
      return
    }

    if (mode === 'manual') {
      onFileSelect?.(file)
      return
    }

    setIsUploading(true)
    // ... rest of auto logic
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      const res = await uploadImage(formData)
      if (res && res.success && res.url) {
        toast.success('تم رفع الصورة بنجاح')
        onUploadSuccess(res.url)
      } else {
        toast.error(res?.error || 'حدث خطأ أثناء الرفع')
      }
    } catch (err) {
      toast.error('فشل الاتصال بالخادم')
    } finally {
      setIsUploading(false)
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  if (variant === 'compact') {
    return (
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`w-full aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all gap-1
          ${isDragOver ? 'border-rose-500 bg-rose-50' : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input type="file" ref={fileInputRef} onChange={onChange} accept="image/*" className="hidden" />
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
        ) : (
          <>
            <div className="h-8 w-8 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-rose-500 transition-colors">
              <UploadCloud className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black text-zinc-400 uppercase">إضافة</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div
        className={`relative w-full border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden
          ${isDragOver ? 'border-rose-500 bg-rose-50' : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'}
          ${isUploading ? 'pointer-events-none opacity-70' : ''}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onChange}
          accept="image/*"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center py-6 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-rose-500" />
            <p className="text-sm font-bold">جاري رفع الصورة...</p>
          </div>
        ) : currentUrl ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="relative h-32 w-full max-w-[200px] flex items-center justify-center bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentUrl} alt="Preview" className="max-h-full object-contain" />
            </div>
            <p className="text-xs font-bold text-zinc-500 flex items-center gap-1">
              <UploadCloud className="h-4 w-4" />
              انقر أو اسحب لتغيير الصورة
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-zinc-400">
            <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <ImageIcon className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-zinc-600 mb-1">انقر لاختيار صورة أو اسحبها هنا</p>
            <p className="text-xs font-medium text-zinc-400 leading-tight text-center">
              PNG, JPG, WEBP <br /> (الحد الأقصى 2MB)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
