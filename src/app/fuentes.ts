import localFont from 'next/font/local';

// Urbanist, servida desde el propio sitio (no depende de Google Fonts en tiempo de ejecución).
// Los mismos TTF los usan el PDF del certificado y las imágenes para historias.
export const urbanist = localFont({
  src: [
    { path: '../fonts/Urbanist-400.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/Urbanist-500.ttf', weight: '500', style: 'normal' },
    { path: '../fonts/Urbanist-600.ttf', weight: '600', style: 'normal' },
    { path: '../fonts/Urbanist-700.ttf', weight: '700', style: 'normal' },
    { path: '../fonts/Urbanist-800.ttf', weight: '800', style: 'normal' },
  ],
  variable: '--font-urbanist',
  display: 'swap',
});
