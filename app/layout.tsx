import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto'
});

export const metadata: Metadata = {
  title: 'Sức Khỏe - Chia sẻ kiến thức sức khỏe',
  description: 'Nền tảng chia sẻ kiến thức sức khỏe, lối sống lành mạnh, cộng đồng yêu sức khỏe',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${roboto.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
