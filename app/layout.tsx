import Header from '@/app/ui/Header';

import { lusitana } from '@/app/ui/fonts';
import '@/app/ui/global.css';
import { ToastContainer } from 'react-toastify';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
       <body className={`${lusitana.className} antialiased`}>
          <Header />
          <ToastContainer />
          <main>{children}</main>
      </body>
    </html>
  );
}
