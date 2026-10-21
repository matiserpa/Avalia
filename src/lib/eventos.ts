// Métricas del piloto. Ver el comentario de la tabla `eventos` en src/db/schema.ts.

import 'server-only';
import { headers } from 'next/headers';
import { db } from '@/db';
import { CANALES, eventos, type Canal, type TipoEvento } from '@/db/schema';

export async function registrarEvento(e: {
  tipo: TipoEvento;
  canal?: Canal | null;
  perfilUsuarioId?: string | null;
  certificadoId?: string | null;
  institucionId?: string | null;
}): Promise<void> {
  try {
    await db.insert(eventos).values({
      tipo: e.tipo,
      canal: e.canal ?? null,
      perfilUsuarioId: e.perfilUsuarioId ?? null,
      certificadoId: e.certificadoId ?? null,
      institucionId: e.institucionId ?? null,
    });
  } catch (err) {
    // Una métrica que falla nunca rompe la página.
    console.error('No se pudo registrar el evento', e.tipo, err);
  }
}

// El ?c= de los links compartidos → canal. Cualquier otra cosa cuenta como 'directo'.
export function canalDesdeParametro(c: string | string[] | undefined): Canal {
  const v = Array.isArray(c) ? c[0] : c;
  return v && (CANALES as readonly string[]).includes(v) ? (v as Canal) : 'directo';
}

// Los programas que arman la vista previa de un link (WhatsApp, Instagram, Telegram...) y los
// buscadores abren las páginas solos: no son personas y no cuentan como visita. Se mira el
// navegador en el momento y no se guarda.
const ROBOTS =
  /bot\b|crawler|spider|facebookexternalhit|facebookcatalog|WhatsApp|TelegramBot|Twitterbot|Slackbot|Discordbot|LinkedInBot|SkypeUriPreview|Embedly|Pinterest|vkShare|Google-|-Google|Bingbot|BingPreview|Slurp|DuckDuckBot|baiduspider|yandex|applebot|redditbot|ia_archiver|GPTBot|Yeti/i;

export async function esRobot(): Promise<boolean> {
  const ua = (await headers()).get('user-agent') || '';
  return ROBOTS.test(ua);
}
