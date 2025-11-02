import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from '@/lib/wagmi/providers';
import { Toaster } from 'sonner';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
    <html
      lang="en"
      className={`${fontSans.variable} ${jetbrainsMono.variable}`}
    >
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
