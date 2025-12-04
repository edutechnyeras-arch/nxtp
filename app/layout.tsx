import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'NPTEL Certificate Verification',
  description: 'NPTEL Certificate Verification',
  generator: 'v0.app',
  applicationName: 'NPTEL',
  metadataBase: new URL('http://archivenptels.co.in'),
  openGraph: {
    title: 'NPTEL Certificate Verification',
    description: 'Verify your NPTEL certificate',
    url: 'http://archivenptels.co.in',
    siteName: 'NPTEL',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NPTEL Certificate Verification',
    description: 'Verify your NPTEL certificate',
  },
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
