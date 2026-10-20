import localFont from 'next/font/local';

export const montserrat = localFont({
  src: [
    { path: '../../public/assets/Fuentes/Montserrat/Montserrat-Regular.ttf',   weight: '400', style: 'normal' },
    { path: '../../public/assets/Fuentes/Montserrat/Montserrat-Medium.ttf',    weight: '500', style: 'normal' },
    { path: '../../public/assets/Fuentes/Montserrat/Montserrat-SemiBold.ttf',  weight: '600', style: 'normal' },
    { path: '../../public/assets/Fuentes/Montserrat/Montserrat-Bold.ttf',      weight: '700', style: 'normal' },
    { path: '../../public/assets/Fuentes/Montserrat/Montserrat-ExtraBold.ttf', weight: '800', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
});

export const outfit = localFont({
  src: '../../public/assets/Fuentes/Outfit/Outfit-VariableFont_wght.ttf',
  variable: '--font-display',
  weight: '100 900',
  display: 'swap',
});
