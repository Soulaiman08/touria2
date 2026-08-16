import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { requireAdmin } from '@/lib/auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function POST(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    const formData = await request.formData()

    const file =
      (formData.get('file') as File | null) ||
      (formData.get('image') as File | null)

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
    if (!allowedTypes.has(file.type) || file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Only JPEG, PNG, or WebP images up to 5 MB are allowed' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'thuraya-almaghribi',
      resource_type: 'image',
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: 'Failed to upload image',
      },
      {
        status: 500,
      }
    )
  }
}
