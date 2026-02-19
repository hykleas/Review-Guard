import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ReviewGuard - Google Maps İtibar Yönetimi',
  description: 'İşletmenizin Google Maps itibarını akıllıca yönetin. 5 yıldızı garantileyin, olumsuz yorumları içeride çözün.',
  keywords: 'google maps, yorum yönetimi, itibar, qr kod, müşteri memnuniyeti',
  authors: [{ name: 'ReviewGuard' }],
  openGraph: {
    title: 'ReviewGuard - Google Maps İtibar Yönetimi',
    description: 'İşletmenizin Google Maps itibarını akıllıca yönetin.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}