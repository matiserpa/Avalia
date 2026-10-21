// PDF del certificado: A4 apaisado, con los datos de la institución, el QR que lleva a la
// página de verificación y el código para escribir a mano.
//
// Se genera en el momento en que se descarga y no se guarda: así siempre refleja el estado
// actual, y un certificado anulado ya no se puede descargar.

import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, degrees, type PDFFont, type PDFPage } from 'pdf-lib';
import sharp from 'sharp';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, cursos, imagenes, instituciones, type TipoCurso } from '@/db/schema';
import { MARCA } from '@/config/marca';
import { urlBase } from '@/lib/config';
import { qrPng } from '@/lib/qr';
import { fechaCorta, fechaLarga, horas, TIPOS_CURSO } from '@/lib/texto';
import { formatearCodigo } from './codigo';

export type DatosCertificadoPdf = {
  codigo: string;
  titularNombre: string;
  titularApellido: string;
  cursoNombre: string;
  tipo: TipoCurso;
  cargaHoraria: number;
  // 'AAAA-MM-DD'
  fecha: string;
  docente: string | null;
  institucionNombre: string;
  // Bytes de la imagen guardada (WebP); se convierte a PNG para el PDF.
  institucionLogo: Uint8Array | null;
  emitidoEn: Date;
  // Certificado de muestra (vista previa de la institución): lleva una marca de agua.
  muestra?: boolean;
};

const VERBOS: Record<TipoCurso, string> = {
  formacion: 'completó',
  congreso: 'asistió a',
  masterclass: 'participó de',
  workshop: 'participó de',
  jornada: 'asistió a',
};

function hex(h: string) {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
const C = {
  papel: hex('#FFFDF9'),
  crema: hex('#E8E0D5'),
  tinta: hex('#0F1210'),
  suave: hex('#4B4F4A'),
  tierra: hex('#7A5A43'),
  verde: hex('#2E6B51'),
};

let fuentes: Promise<Record<'r' | 'm' | 'sb' | 'b' | 'xb', Buffer>> | null = null;
function leerFuentes() {
  fuentes ??= (async () => {
    const dir = path.join(process.cwd(), 'src', 'fonts');
    const [r, m, sb, b, xb] = await Promise.all(
      ['400', '500', '600', '700', '800'].map((w) => readFile(path.join(dir, `Urbanist-${w}.ttf`))),
    );
    return { r, m, sb, b, xb };
  })();
  return fuentes;
}

// Achica el tamaño hasta que el texto entre en el ancho.
function tamanoQueEntra(texto: string, fuente: PDFFont, maximo: number, ancho: number, minimo = 14) {
  let t = maximo;
  while (t > minimo && fuente.widthOfTextAtSize(texto, t) > ancho) t -= 1;
  return t;
}

// Corta en renglones por palabras.
function renglones(texto: string, fuente: PDFFont, tamano: number, ancho: number, max = 2): string[] {
  const palabras = texto.split(/\s+/);
  const out: string[] = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (fuente.widthOfTextAtSize(prueba, tamano) <= ancho || !actual) actual = prueba;
    else {
      out.push(actual);
      actual = p;
    }
  }
  if (actual) out.push(actual);
  if (out.length > max) {
    const resto = out.slice(max - 1).join(' ');
    out.length = max - 1;
    let ultimo = resto;
    while (fuente.widthOfTextAtSize(`${ultimo}…`, tamano) > ancho && ultimo.length > 1) ultimo = ultimo.slice(0, -1);
    out.push(ultimo === resto ? ultimo : `${ultimo.trimEnd()}…`);
  }
  return out;
}

function centrado(page: PDFPage, texto: string, y: number, fuente: PDFFont, tamano: number, color = C.tinta, espaciado = 0) {
  const { width } = page.getSize();
  const w = fuente.widthOfTextAtSize(texto, tamano) + espaciado * Math.max(0, texto.length - 1);
  if (!espaciado) {
    page.drawText(texto, { x: (width - w) / 2, y, size: tamano, font: fuente, color });
    return;
  }
  // pdf-lib no tiene letter-spacing: se dibuja letra por letra.
  let x = (width - w) / 2;
  for (const ch of texto) {
    page.drawText(ch, { x, y, size: tamano, font: fuente, color });
    x += fuente.widthOfTextAtSize(ch, tamano) + espaciado;
  }
}

export async function generarPdfCertificado(d: DatosCertificadoPdf): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const f = await leerFuentes();
  const [r, m, sb, b, xb] = await Promise.all([
    pdf.embedFont(f.r, { subset: true }),
    pdf.embedFont(f.m, { subset: true }),
    pdf.embedFont(f.sb, { subset: true }),
    pdf.embedFont(f.b, { subset: true }),
    pdf.embedFont(f.xb, { subset: true }),
  ]);

  const nombreCompleto = `${d.titularNombre} ${d.titularApellido}`.trim();
  pdf.setTitle(`Certificado ${formatearCodigo(d.codigo)} — ${nombreCompleto}`);
  pdf.setAuthor(d.institucionNombre);
  pdf.setSubject(d.cursoNombre);
  pdf.setCreator(MARCA.nombre);
  pdf.setProducer(MARCA.nombre);
  pdf.setLanguage('es-AR');

  // A4 apaisado: 842 × 595 pt.
  const page = pdf.addPage([841.89, 595.28]);
  const { width: W, height: H } = page.getSize();

  // Fondo y marco.
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.papel });
  page.drawRectangle({ x: 22, y: 22, width: W - 44, height: H - 44, borderColor: C.crema, borderWidth: 1.5 });
  page.drawRectangle({ x: 30, y: 30, width: W - 60, height: H - 60, borderColor: C.tierra, borderWidth: 0.6, opacity: 0 });

  // Encabezado: logo e institución a la izquierda; marca a la derecha.
  let xTexto = 64;
  if (d.institucionLogo) {
    try {
      const png = await sharp(Buffer.from(d.institucionLogo)).resize(240, 240, { fit: 'inside' }).png().toBuffer();
      const img = await pdf.embedPng(png);
      const lado = 56;
      const esc = Math.min(lado / img.width, lado / img.height);
      page.drawImage(img, { x: 64, y: H - 64 - img.height * esc, width: img.width * esc, height: img.height * esc });
      xTexto = 64 + lado + 14;
    } catch {
      // Un logo que no se puede leer no frena el certificado.
    }
  }
  page.drawText(d.institucionNombre, { x: xTexto, y: H - 86, size: 13, font: b, color: C.tinta, maxWidth: 420 });
  page.drawText('Institución emisora', { x: xTexto, y: H - 101, size: 9.5, font: r, color: C.suave });

  const marca = MARCA.nombre;
  const wMarca = sb.widthOfTextAtSize(marca, 10.5);
  page.drawText(marca, { x: W - 64 - wMarca, y: H - 86, size: 10.5, font: sb, color: C.tierra });
  const sub = 'Certificado verificable';
  page.drawText(sub, { x: W - 64 - r.widthOfTextAtSize(sub, 9.5), y: H - 101, size: 9.5, font: r, color: C.suave });

  // Cuerpo centrado.
  centrado(page, 'CERTIFICADO', H - 168, sb, 12, C.tierra, 4);
  centrado(page, 'Se certifica que', H - 204, r, 14, C.suave);

  const anchoUtil = W - 200;
  const tNombre = tamanoQueEntra(nombreCompleto, xb, 40, anchoUtil, 22);
  centrado(page, nombreCompleto, H - 254, xb, tNombre);
  page.drawLine({ start: { x: W / 2 - 150, y: H - 270 }, end: { x: W / 2 + 150, y: H - 270 }, thickness: 0.8, color: C.crema });

  centrado(page, VERBOS[d.tipo], H - 300, r, 14, C.suave);
  const lineasCurso = renglones(d.cursoNombre, b, 22, anchoUtil, 2);
  let y = H - 332;
  for (const linea of lineasCurso) {
    centrado(page, linea, y, b, 22);
    y -= 28;
  }

  const detalles = [`${TIPOS_CURSO[d.tipo].nombre} de ${horas(d.cargaHoraria)}`, fechaLarga(d.fecha)];
  centrado(page, detalles.join('  ·  '), y - 6, m, 12.5, C.tinta);
  if (d.docente) {
    const lineasDocente = renglones(`A cargo de ${d.docente}`, r, 11.5, anchoUtil, 1);
    centrado(page, lineasDocente[0], y - 26, r, 11.5, C.suave);
  }

  // Pie: verificación a la izquierda, QR a la derecha.
  const urlVerificacion = `${urlBase()}/v/${d.codigo}?c=qr`;
  const qr = await pdf.embedPng(await qrPng(urlVerificacion, 480));
  const ladoQr = 92;
  page.drawImage(qr, { x: W - 64 - ladoQr, y: 54, width: ladoQr, height: ladoQr });

  page.drawText('Código de verificación', { x: 64, y: 122, size: 9.5, font: r, color: C.suave });
  page.drawText(formatearCodigo(d.codigo), { x: 64, y: 100, size: 20, font: b, color: C.tinta });
  page.drawText(`Emitido el ${fechaCorta(d.emitidoEn)} por ${d.institucionNombre}.`, {
    x: 64,
    y: 80,
    size: 9.5,
    font: r,
    color: C.suave,
    maxWidth: 520,
  });
  const dominio = urlBase().replace(/^https?:\/\//, '');
  page.drawText(`Escaneá el QR o entrá a ${dominio}/verificar y escribí el código para comprobar que es auténtico.`, {
    x: 64,
    y: 64,
    size: 9.5,
    font: r,
    color: C.suave,
    maxWidth: W - 64 - ladoQr - 64 - 24,
  });

  if (d.muestra) {
    const texto = 'MUESTRA · SIN VALIDEZ';
    const t = 54;
    const w = xb.widthOfTextAtSize(texto, t);
    page.drawText(texto, {
      x: W / 2 - (w / 2) * Math.cos(Math.PI / 9),
      y: H / 2 - (w / 2) * Math.sin(Math.PI / 9),
      size: t,
      font: xb,
      color: C.tierra,
      opacity: 0.16,
      rotate: degrees(20),
    });
  }

  return pdf.save();
}

// Junta los datos de un certificado guardado para generar su PDF. Null si no existe.
// No chequea permisos: eso lo hace quien la llama.
export async function datosPdfDeCertificado(certificadoId: string): Promise<(DatosCertificadoPdf & { estado: 'valido' | 'anulado'; usuarioId: string | null; institucionId: string }) | null> {
  const [fila] = await db
    .select({ cert: certificados, curso: cursos, inst: instituciones, logo: imagenes.datos })
    .from(certificados)
    .innerJoin(cursos, eq(cursos.id, certificados.cursoId))
    .innerJoin(instituciones, eq(instituciones.id, certificados.institucionId))
    .leftJoin(imagenes, eq(imagenes.id, instituciones.logoId))
    .where(eq(certificados.id, certificadoId))
    .limit(1);
  if (!fila) return null;
  return {
    codigo: fila.cert.codigo,
    titularNombre: fila.cert.titularNombre,
    titularApellido: fila.cert.titularApellido,
    cursoNombre: fila.curso.nombre,
    tipo: fila.curso.tipo,
    cargaHoraria: fila.curso.cargaHoraria,
    fecha: fila.curso.fecha,
    docente: fila.curso.docente,
    institucionNombre: fila.inst.nombre,
    institucionLogo: fila.logo ?? null,
    emitidoEn: fila.cert.emitidoEn,
    estado: fila.cert.estado,
    usuarioId: fila.cert.usuarioId,
    institucionId: fila.cert.institucionId,
  };
}

export function nombreArchivoPdf(d: Pick<DatosCertificadoPdf, 'codigo' | 'cursoNombre'>): string {
  const curso = d.cursoNombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return `Certificado-${curso}-${formatearCodigo(d.codigo)}.pdf`;
}
