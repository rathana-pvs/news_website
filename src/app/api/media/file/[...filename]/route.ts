import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  try {
    const { filename } = await params
    
    // Decode each path segment to handle spaces (%20) and other special characters
    const decodedSegments = filename.map(segment => decodeURIComponent(segment))
    const filePath = path.join(process.cwd(), 'public/media', ...decodedSegments)
    
    // Safety check: Prevent directory traversal
    const relativePath = path.relative(path.join(process.cwd(), 'public/media'), filePath)
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }
    
    const fileBuffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()
    
    let contentType = 'application/octet-stream'
    if (ext === '.png') contentType = 'image/png'
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.gif') contentType = 'image/gif'
    else if (ext === '.webp') contentType = 'image/webp'
    else if (ext === '.avif') contentType = 'image/avif'
    else if (ext === '.mp4') contentType = 'video/mp4'
    else if (ext === '.webm') contentType = 'video/webm'
    else if (ext === '.mov') contentType = 'video/quicktime'

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      // Never let an uploaded file run scripts on this origin (e.g. a legacy SVG).
      'Content-Security-Policy': "default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'; sandbox",
    }
    // Anything not explicitly whitelisted above (including .svg/.html) is downloaded, not rendered.
    if (contentType === 'application/octet-stream') {
      headers['Content-Disposition'] = 'attachment'
    }

    return new NextResponse(fileBuffer, { headers })
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
