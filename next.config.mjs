import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: 'dam.mediacorp.sg',
      },
      {
        protocol: 'https',
        hostname: 'media-cldnry.s-nbcnews.com',
      },
      {
        protocol: 'https',
        hostname: 'asiandot.com',
      },
      {
        protocol: 'https',
        hostname: 'www.asiandot.com',
      },
    ],
  },
  async headers() {
    // Uploaded files are served from /media (public/media) on this origin.
    // Sandbox them so a stored SVG/HTML file can never run scripts here.
    return [
      {
        source: '/media/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'; sandbox",
          },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
