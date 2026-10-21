// Íconos de trazo, 24×24, heredan el color del texto. Decorativos por defecto (aria-hidden):
// el texto del botón o una etiqueta es lo que lee el lector de pantalla.

const TRAZOS: Record<string, React.ReactNode> = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  'check-circulo': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.8 2.8L16.2 9.6" />
    </>
  ),
  cruz: <path d="M6 6l12 12M18 6L6 18" />,
  'cruz-circulo': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  alerta: (
    <>
      <path d="M12 3.5l9 16H3l9-16z" />
      <path d="M12 10v4.2M12 17.2v.3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8v.3" />
    </>
  ),
  copiar: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6.5a2 2 0 00-2-2h-7a2 2 0 00-2 2v7a2 2 0 002 2h2" />
    </>
  ),
  descargar: <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />,
  subir: <path d="M12 16V5m0 0L7.5 9.5M12 5l4.5 4.5M5 19.5h14" />,
  compartir: (
    <>
      <path d="M12 3.5v11M12 3.5L8 7.5M12 3.5l4 4" />
      <path d="M8 11H6.5A1.5 1.5 0 005 12.5v6A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5v-6a1.5 1.5 0 00-1.5-1.5H16" />
    </>
  ),
  qr: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h2v2h-2zM18 14h2M14 18v2M18 18h2v2" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
    </>
  ),
  ojo: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'ojo-tachado': (
    <>
      <path d="M4 4l16 16" />
      <path d="M9.9 5.8A9.6 9.6 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 01-2.7 3.5M6.6 7.6C4 9.4 2.5 12 2.5 12S6 18.5 12 18.5c1.5 0 2.8-.4 4-1" />
      <path d="M10 10a3 3 0 004 4" />
    </>
  ),
  candado: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" />
    </>
  ),
  mundo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  lupa: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  flecha: <path d="M5 12h14m0 0l-5.5-5.5M19 12l-5.5 5.5" />,
  'flecha-izq': <path d="M19 12H5m0 0l5.5-5.5M5 12l5.5 5.5" />,
  'flecha-arriba-der': <path d="M7 17L17 7m0 0H9m8 0v8" />,
  mas: <path d="M12 5v14M5 12h14" />,
  editar: <path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16v4zM13.5 6.5l4 4" />,
  basura: <path d="M4.5 7h15M9.5 7V5h5v2M6.5 7l1 12.5h9l1-12.5M10 11v5M14 11v5" />,
  salir: <path d="M14 5h3.5A1.5 1.5 0 0119 6.5v11a1.5 1.5 0 01-1.5 1.5H14M10 16l-4-4 4-4M6 12h9" />,
  usuario: (
    <>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4.5 20c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5" />
    </>
  ),
  foto: (
    <>
      <rect x="3.5" y="6" width="17" height="13" rx="2.5" />
      <path d="M8.5 6l1.5-2h4l1.5 2" />
      <circle cx="12" cy="12.5" r="3.5" />
    </>
  ),
  libro: (
    <>
      <path d="M4 5.5A1.5 1.5 0 015.5 4H11v16H5.5A1.5 1.5 0 014 18.5v-13zM20 5.5A1.5 1.5 0 0018.5 4H13v16h5.5a1.5 1.5 0 001.5-1.5v-13z" />
    </>
  ),
  calendario: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  ubicacion: (
    <>
      <path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0113 0C18.5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.8" r="2.4" />
    </>
  ),
  edificio: (
    <>
      <path d="M4 20.5h16M6 20.5V8l6-4 6 4v12.5" />
      <path d="M9.5 11h1M13.5 11h1M9.5 14.5h1M13.5 14.5h1M11 20.5v-3h2v3" />
    </>
  ),
  grafico: <path d="M4 20h16M7 16.5V11M12 16.5V6.5M17 16.5v-8" />,
  whatsapp: (
    <>
      <path d="M4 20l1.2-4A8.2 8.2 0 1112 20.2a8.4 8.4 0 01-4-1L4 20z" />
      <path d="M9 8.6c0 3.4 2.9 6.3 6.3 6.4l1.1-1.4-2-1-1 .9c-1-.5-1.8-1.3-2.3-2.3l.9-1-1-2L9.7 8.4z" />
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M16.8 7.2v.1" />
    </>
  ),
  imprimir: (
    <>
      <path d="M7 9V4h10v5" />
      <rect x="4" y="9" width="16" height="7.5" rx="2" />
      <path d="M7 14h10v6H7z" />
    </>
  ),
  imagen: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <circle cx="9" cy="9.5" r="1.8" />
      <path d="M20 15.5l-4.5-4.5L6 20" />
    </>
  ),
  planilla: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 9.5h16M4 15h16M10 9.5V20" />
    </>
  ),
  reiniciar: <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
};

export type NombreIcono = keyof typeof TRAZOS;

export function Icono({
  nombre,
  className = 'size-5',
  etiqueta,
}: {
  nombre: NombreIcono;
  className?: string;
  // Sólo si el ícono va solo, sin texto al lado.
  etiqueta?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={etiqueta ? undefined : true}
      role={etiqueta ? 'img' : undefined}
      aria-label={etiqueta}
      focusable="false"
    >
      {TRAZOS[nombre]}
    </svg>
  );
}
