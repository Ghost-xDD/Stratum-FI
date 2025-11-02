import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from '@/lib/wagmi/providers';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Stratum Fi - Self-Repaying Loans on Bitcoin',
  description:
    'Deposit Bitcoin, borrow stablecoins. Your yield automatically repays your debt. No liquidations, no manual payments.',
  keywords: 'Bitcoin, DeFi, Self-repaying loans, Mezo, Stratum',
  openGraph: {
    title: 'Stratum Fi - Self-Repaying Loans on Bitcoin',
    description: 'Make Your Bitcoin Work For You',
    type: 'website',
    locale: 'en_US',
    siteName: 'Stratum Fi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stratum Fi - Self-Repaying Loans on Bitcoin',
    description: 'Make Your Bitcoin Work For You',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-dark-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
