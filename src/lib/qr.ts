// Códigos QR. Para el PDF (PNG) y para mostrar en pantalla (SVG).

import 'server-only';
import QRCode from 'qrcode';

const COLORES = { dark: '#0F1210', light: '#FFFFFF' };

export async function qrPng(url: string, ancho = 600): Promise<Buffer> {
  return QRCode.toBuffer(url, { type: 'png', errorCorrectionLevel: 'M', margin: 1, width: ancho, color: COLORES });
}

// SVG listo para insertar en la página (dangerouslySetInnerHTML) o servir como archivo.
export async function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 1, color: COLORES });
}
