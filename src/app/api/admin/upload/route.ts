import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null || formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name) || '.jpg'
    const fileName = `${uuidv4()}${ext}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    const url = `/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      url,
      fileName,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    const msg = error instanceof Error ? error.message : 'Failed to upload file'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
