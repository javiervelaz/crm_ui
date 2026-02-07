import { Inter, Lusitana } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const lusitana = Lusitana({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
});
