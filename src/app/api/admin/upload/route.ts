import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(request: Request) {
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