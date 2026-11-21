'use client'

import React, { useState, useRef } from 'react'
import NextImage from 'next/image'
import { UploadCloud, X, Star, Loader2 } from 'lucide-react'
import { useToast } from '../providers/ToastContext'
import { useAdminI18n } from '../providers/AdminI18nContext'

interface ImageUploaderProps {
  images: string[]
  mainImage?: string
  onChange: (images: string[], mainImage: string) => void
  multiple?: boolean
  aspectRatio?: 'square' | 'video'
}

export function ImageUploader({
  images,
  mainImage,
  onChange,
  multiple = true,
  aspectRatio = 'square',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { error, success } = useToast()
  const { tr } = useAdminI18n()

  const handleUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
    const maxBytes = 5 * 1024 * 1024

    setUploading(true)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!allowedTypes.has(file.type)) {
          throw new Error(
            tr(
              `صيغة غير مدعومة (${file.name}). يرجى رفع JPEG أو PNG أو WebP.`,
              `Unsupported format (${file.name}). Please upload JPEG, PNG, or WebP.`
            )
          )
        }
        if (file.size > maxBytes) {
          throw new Error(
            tr(
              `الملف "${file.name}" يتجاوز الحد الأقصى 5 ميغابايت.`,
              `File "${file.name}" exceeds the 5 MB limit.`
            )
          )
        }

        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
        if (!res.ok) {
          throw new Error(data.error || tr('فشل رفع الصورة', 'Failed to upload image'))
        }

        if (data.url) {
          newUrls.push(data.url)
        }
      }

      const updatedList = multiple ? [...images, ...newUrls] : newUrls
      const primary = mainImage || updatedList[0] || ''
      onChange(updatedList, primary)
      success(
        tr(
          `تم رفع ${newUrls.length} صورة بنجاح`,
          `${newUrls.length} image(s) uploaded successfully`
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : tr('حدث خطأ أثناء رفع الصور', 'Error uploading images')
      error(message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      handleUpload(e.dataTransfer.files)
    }
  }

  const removeImage = (index: number) => {
    const target = images[index]
    const updated = images.filter((_, i) => i !== index)
    const nextMain = target === mainImage ? updated[0] || '' : mainImage || updated[0] || ''
    onChange(updated, nextMain)
  }

  const setAsMain = (url: string) => {
    onChange(images, url)
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 scale-[0.99]'
            : 'border-zinc-700 bg-zinc-950/60 hover:border-amber-500/60 hover:bg-zinc-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-zinc-300 py-3">
            <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
            <p className="text-xs sm:text-sm font-semibold">{tr('جارٍ رفع الصور...', 'Uploading images...')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center py-1">
            <div className="p-2.5 bg-zinc-800/90 border border-zinc-700/70 rounded-xl text-amber-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-zinc-200">
                <span className="text-amber-400">{tr('اضغط لاختيار صورة', 'Click to upload')}</span>{' '}
                {tr('أو اسحبها وأفلتها هنا', 'or drag and drop')}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                {tr('JPEG أو PNG أو WebP بحد أقصى 5 ميغابايت', 'JPEG, PNG, WebP up to 5 MB')}
              </p>
            </div>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div
          className={
            aspectRatio === 'video'
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'
              : 'grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1'
          }
        >
          {images.map((imgUrl, idx) => {
            const isMain = imgUrl === mainImage
            return (
              <div
                key={`${imgUrl}-${idx}`}
                className={`relative group rounded-xl overflow-hidden border bg-zinc-950 transition-all ${
                  aspectRatio === 'video' ? 'aspect-video' : 'aspect-square'
                } ${isMain ? 'border-amber-500 ring-2 ring-amber-500/25' : 'border-zinc-800 hover:border-zinc-600'}`}
              >
                <NextImage
                  src={imgUrl}
                  alt={tr(`صورة ${idx + 1}`, `Upload ${idx + 1}`)}
                  fill
                  sizes={aspectRatio === 'video' ? '(max-width: 640px) 100vw, 480px' : '256px'}
                  quality={92}
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />

                {isMain && (
                  <div className="absolute top-2 start-2 px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 font-bold text-[10px] flex items-center gap-1 shadow-md pointer-events-none">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{tr('رئيسية', 'Main')}</span>
                  </div>
                )}

                {/* Always accessible on touchscreens, refined hover overlay on desktop */}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-center justify-end gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                  {multiple && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setAsMain(imgUrl)
                      }}
                      title={tr('تعيين كصورة رئيسية', 'Set as main image')}
                      aria-label={tr('تعيين كصورة رئيسية', 'Set as main image')}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                        isMain
                          ? 'bg-amber-500 text-zinc-950'
                          : 'bg-zinc-900/90 text-zinc-200 border border-zinc-700 hover:bg-amber-500 hover:text-zinc-950'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(idx)
                    }}
                    title={tr('إزالة الصورة', 'Remove image')}
                    aria-label={tr('إزالة الصورة', 'Remove image')}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-rose-600/90 text-white hover:bg-rose-500 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
