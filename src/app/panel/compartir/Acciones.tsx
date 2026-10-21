'use client';

// Botones de compartir que, además, registran el canal para las métricas del piloto.

import { useEffect, useState } from 'react';
import { Boton, clasesBoton } from '@/components/ui/Boton';
import { CopiarTexto } from '@/components/ui/CopiarTexto';
import { Icono } from '@/components/ui/Icono';
import { registrarCompartir } from './acciones';

export function CopiarLink({ texto, etiqueta }: { texto: string; etiqueta: string }) {
  const legible = texto.replace(/^https?:\/\//, '').replace(/\?.*$/, '');
  return <CopiarTexto texto={texto} etiqueta={etiqueta} legible={legible} alCopiar={() => void registrarCompartir('copiar_link')} />;
}

// "Compartir" del celular (WhatsApp, Instagram, mail…). Sólo aparece si el navegador lo permite.
export function CompartirNativo({ url, titulo }: { url: string; titulo: string }) {
  const [disponible, setDisponible] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- se sabe recién en el navegador
    setDisponible(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);
  if (!disponible) return null;
  return (
    <Boton
      type="button"
      icono="compartir"
      anchoCompleto
      onClick={async () => {
        try {
          await navigator.share({ title: titulo, text: 'Mirá mi formación verificada', url });
          void registrarCompartir('compartir_nativo');
        } catch {
          // Canceló: no pasa nada.
        }
      }}
    >
      Compartir
    </Boton>
  );
}

export function Imprimir({ children = 'Imprimir' }: { children?: React.ReactNode }) {
  return (
    <Boton
      type="button"
      icono="imprimir"
      onClick={() => {
        void registrarCompartir('qr_consultorio');
        window.print();
      }}
    >
      {children}
    </Boton>
  );
}

export function Descargar({
  href,
  canal,
  children,
  variante = 'secundario',
}: {
  href: string;
  canal: 'qr_consultorio' | 'imagen_historia';
  children: React.ReactNode;
  variante?: 'primario' | 'secundario';
}) {
  return (
    <a href={href} download className={clasesBoton({ variante })} onClick={() => void registrarCompartir(canal)}>
      <Icono nombre="descargar" />
      {children}
    </a>
  );
}
