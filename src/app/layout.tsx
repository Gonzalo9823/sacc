import '~/styles/globals.css';

import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { Toaster } from 'react-hot-toast';

import { TRPCReactProvider } from '~/trpc/react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Locker Hub',
  description: 'Locker Hub',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full bg-white">
      <body className={`h-full font-sans ${inter.variable}`}>
        <Toaster />
        <TRPCReactProvider headers={headers()}>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
