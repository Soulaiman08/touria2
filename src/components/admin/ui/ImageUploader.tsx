'use client'

import React, { useState, useRef } from 'react'
import NextImage from 'next/image'
import { UploadCloud, X, Star, Loader2 } from 'lucide-react'
import { useToast } from '../providers/ToastContext'

interface ImageUploaderProps {
  images: string[]
  mainImage?: string
  onChange: (images: string[], mainImage: string) => void
  multiple?: boolean
}

export function ImageUploader({ images, mainImage, onChange, multiple = true }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { error, success } = useToast()

  const handleUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          throw new Error('Failed to upload image')
        }

        const data = await res.json()
        if (data.url) {
          newUrls.push(data.url)
        }
      }

      const updatedList = multiple ? [...images, ...newUrls] : newUrls
      const primary = mainImage || updatedList[0] || ''
      onChange(updatedList, primary)
      success(`${newUrls.length} image(s) uploaded successfully!`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error uploading images'
      error(message)
    } finally {
      setUploading(false)
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10 scale-[0.99]'
            : 'border-zinc-700 bg-zinc-900/60 hover:border-zinc-500 hover:bg-zinc-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-zinc-400 py-4">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-sm font-medium">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center py-2">
            <div className="p-3 bg-zinc-800 rounded-full text-zinc-300">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-200">
                <span className="text-emerald-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-zinc-400 mt-1">PNG, JPG, WEBP, GIF up to 10MB</p>
            </div>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {images.map((imgUrl, idx) => {
            const isMain = imgUrl === mainImage
            return (
              <div
                key={idx}
                className={`relative group rounded-xl overflow-hidden border bg-zinc-900 aspect-square transition-all ${
                  isMain ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="relative w-full h-full">
                  <NextImage src={imgUrl} alt={`Upload ${idx}`} fill className="object-cover" sizes="128px" />
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setAsMain(imgUrl)
                    }}
                    title="Set as Main Image"
                    className={`p-2 rounded-lg transition-colors ${
                      isMain ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-200 hover:bg-amber-500 hover:text-black'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(idx)
                    }}
                    title="Remove Image"
                    className="p-2 rounded-lg bg-rose-600/90 text-white hover:bg-rose-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isMain && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-current" /> Main
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
