// Plantillas de mail. HTML simple con estilos en línea (lo único que respetan todos los
// clientes de correo) y siempre una versión en texto plano.

import { MARCA } from '@/config/marca';
import type { Correo } from './enviar';

const C = { marfil: '#F5F3EF', crema: '#E8E0D5', tinta: '#0F1210', tierra: '#7A5A43', verde: '#2E6B51', suave: '#4A4F4B' };

function escapar(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
}

function marco(previa: string, cuerpo: string): string {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapar(MARCA.nombre)}</title></head>
<body style="margin:0;padding:0;background:${C.marfil};font-family:Urbanist,'Helvetica Neue',Arial,sans-serif;color:${C.tinta};">
<div style="display:none;max-height:0;overflow:hidden;">${escapar(previa)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.marfil};"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="padding:0 4px 20px;font-size:15px;font-weight:700;letter-spacing:.02em;color:${C.tierra};">${escapar(MARCA.nombre)}</td></tr>
<tr><td style="background:#FFFDF9;border:1px solid ${C.crema};border-radius:16px;padding:32px 28px;font-size:16px;line-height:1.55;">${cuerpo}</td></tr>
<tr><td style="padding:20px 4px 0;font-size:13px;line-height:1.5;color:${C.suave};">${escapar(MARCA.nombre)} es un servicio de ${escapar(MARCA.responsable)}. Si no esperabas este mail, podés ignorarlo.</td></tr>
</table></td></tr></table></body></html>`;
}

function boton(texto: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:${C.tinta};border-radius:999px;">
<a href="${escapar(url)}" style="display:inline-block;padding:15px 28px;font-size:16px;font-weight:700;color:#FFFFFF;text-decoration:none;">${escapar(texto)}</a></td></tr></table>`;
}

export function correoCodigo(para: string, codigo: string): Correo {
  const asunto = `Tu código para ingresar: ${codigo}`;
  const html = marco(
    `Usalo en los próximos 10 minutos.`,
    `<p style="margin:0 0 8px;">Tu código para ingresar a ${escapar(MARCA.nombre)} es:</p>
<p style="margin:16px 0;font-size:34px;font-weight:800;letter-spacing:.18em;">${codigo}</p>
<p style="margin:0;color:${C.suave};">Vence en 10 minutos. Si no lo pediste vos, ignorá este mail: nadie puede entrar sin el código.</p>`,
  );
  const texto = `Tu código para ingresar a ${MARCA.nombre} es: ${codigo}\n\nVence en 10 minutos. Si no lo pediste vos, ignorá este mail.`;
  return { para, asunto, html, texto, plantilla: 'codigo' };
}

export function correoCertificado(d: {
  para: string;
  nombre: string;
  institucion: string;
  curso: string;
  enlace: string;
  yaTieneCuenta: boolean;
  certificadoId: string;
  // La institución lo vuelve a mandar: no es un certificado nuevo.
  reenvio?: boolean;
}): Correo {
  const asunto = d.yaTieneCuenta
    ? d.reenvio
      ? `Tu certificado de ${d.curso} está en tu pasaporte`
      : `Tenés un certificado nuevo de ${d.institucion}`
    : `${d.institucion} te emitió un certificado`;
  const intro = d.yaTieneCuenta
    ? `<p style="margin:0 0 12px;">Hola, ${escapar(d.nombre)}:</p>
<p style="margin:0;">${escapar(d.institucion)} te emitió el certificado de <strong>${escapar(d.curso)}</strong>. Ya está en tu pasaporte de ${escapar(MARCA.nombre)}.</p>`
    : `<p style="margin:0 0 12px;">Hola, ${escapar(d.nombre)}:</p>
<p style="margin:0 0 12px;">${escapar(d.institucion)} te emitió el certificado de <strong>${escapar(d.curso)}</strong>.</p>
<p style="margin:0;">Activá tu pasaporte en ${escapar(MARCA.nombre)} para descargarlo y armar tu perfil con toda tu formación, verificada. Te lleva menos de dos minutos y no necesitás contraseña.</p>`;
  const html = marco(
    `Tu certificado de ${d.curso} ya es verificable.`,
    `${intro}${boton(d.yaTieneCuenta ? 'Ver mi pasaporte' : 'Activar mi pasaporte', d.enlace)}
<p style="margin:0;font-size:14px;color:${C.suave};">Si el botón no funciona, copiá este link en el navegador:<br><span style="word-break:break-all;">${escapar(d.enlace)}</span></p>`,
  );
  const texto = `Hola, ${d.nombre}:\n\n${d.institucion} te emitió el certificado de ${d.curso}.\n\n${
    d.yaTieneCuenta ? 'Ya está en tu pasaporte' : 'Activá tu pasaporte'
  }: ${d.enlace}`;
  return { para: d.para, asunto, html, texto, plantilla: 'certificado', certificadoId: d.certificadoId };
}

export function correoInvitacionInstitucion(d: { para: string; institucion: string; enlace: string }): Correo {
  const asunto = `Ya podés emitir certificados de ${d.institucion}`;
  const html = marco(
    `Tu acceso al panel de ${d.institucion}.`,
    `<p style="margin:0 0 12px;">Hola:</p>
<p style="margin:0;">Te dimos acceso al panel de <strong>${escapar(d.institucion)}</strong> en ${escapar(MARCA.nombre)}. Desde ahí cargás tus cursos y emitís los certificados de tus egresadas.</p>
${boton('Ingresar al panel', d.enlace)}
<p style="margin:0;font-size:14px;color:${C.suave};">Para ingresar te vamos a mandar un código a este mail. No hay contraseña que recordar.</p>`,
  );
  const texto = `Hola:\n\nTe dimos acceso al panel de ${d.institucion} en ${MARCA.nombre}.\n\nIngresá acá: ${d.enlace}\n\nTe vamos a mandar un código a este mail para entrar.`;
  return { para: d.para, asunto, html, texto, plantilla: 'invitacion' };
}
