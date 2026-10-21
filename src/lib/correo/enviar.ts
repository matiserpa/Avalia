// Envío de mails. Dos modos (MAIL_MODE):
// - 'bandeja' (demo y desarrollo): no sale nada; el mail queda guardado y se ve en /demo/bandeja.
// - 'resend': sale por Resend. Se registra a quién y si el proveedor lo aceptó, sin el cuerpo.

import 'server-only';
import { db } from '@/db';
import { correos } from '@/db/schema';
import { MARCA } from '@/config/marca';
import { modoCorreo } from '@/lib/config';

export type Correo = {
  para: string;
  asunto: string;
  html: string;
  texto: string;
  // Nombre de la plantilla, para el registro: 'codigo', 'certificado', 'invitacion'...
  plantilla: string;
  certificadoId?: string;
};

export type ResultadoEnvio = { ok: true } | { ok: false; error: string };

function remitente(): string {
  return process.env.MAIL_FROM || `${MARCA.nombre} <no-responder@example.com>`;
}

async function registrar(c: Correo, r: ResultadoEnvio, guardarCuerpo: boolean) {
  await db.insert(correos).values({
    para: c.para,
    asunto: c.asunto,
    plantilla: c.plantilla,
    html: guardarCuerpo ? c.html : null,
    texto: guardarCuerpo ? c.texto : null,
    estado: guardarCuerpo ? 'bandeja' : r.ok ? 'enviado' : 'error',
    error: r.ok ? null : r.error,
    certificadoId: c.certificadoId ?? null,
  });
}

export async function enviarCorreo(c: Correo): Promise<ResultadoEnvio> {
  const [r] = await enviarCorreos([c]);
  return r;
}

// Varios mails de una vez (la emisión de un curso). En Resend va por lotes de hasta 100,
// para no chocar con el límite de pedidos por segundo ni con el tiempo máximo de una función.
export async function enviarCorreos(lista: Correo[]): Promise<ResultadoEnvio[]> {
  if (lista.length === 0) return [];
  if (modoCorreo() === 'bandeja') {
    const ok: ResultadoEnvio = { ok: true };
    for (const c of lista) await registrar(c, ok, true);
    return lista.map(() => ok);
  }

  const clave = process.env.RESEND_API_KEY;
  const resultados: ResultadoEnvio[] = [];
  for (let i = 0; i < lista.length; i += 100) {
    const lote = lista.slice(i, i + 100);
    let res: ResultadoEnvio[];
    if (!clave) {
      res = lote.map(() => ({ ok: false, error: 'Falta RESEND_API_KEY' }));
    } else {
      try {
        const r = await fetch('https://api.resend.com/emails/batch', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${clave}`,
            'Content-Type': 'application/json',
            // Con 'permissive', un mail inválido no frena a los demás.
            'x-batch-validation': 'permissive',
          },
          body: JSON.stringify(
            lote.map((c) => ({ from: remitente(), to: [c.para], subject: c.asunto, html: c.html, text: c.texto })),
          ),
        });
        const cuerpo = (await r.json().catch(() => ({}))) as {
          errors?: { index: number; message: string }[];
          message?: string;
        };
        if (!r.ok) {
          const msg = cuerpo.message || `Resend respondió ${r.status}`;
          res = lote.map(() => ({ ok: false, error: msg }));
        } else {
          const errores = new Map((cuerpo.errors || []).map((e) => [e.index, e.message]));
          res = lote.map((_, j) => (errores.has(j) ? { ok: false, error: errores.get(j)! } : { ok: true }));
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res = lote.map(() => ({ ok: false, error: msg }));
      }
    }
    for (let j = 0; j < lote.length; j++) await registrar(lote[j], res[j], false);
    resultados.push(...res);
  }
  return resultados;
}
