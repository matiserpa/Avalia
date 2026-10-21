# Sella

Prototipo y piloto de certificados verificables y perfil profesional (el "pasaporte" de cada profesional) para la estética.

Antes de tocar código, leé `docs/estado.md` (qué está hecho y qué sigue) y además:
- `docs/producto.md`: qué es, mapa de pantallas, flujos, decisiones, privacidad y tono.
- `docs/modelo-de-datos.md`: las tablas y por qué.
- `docs/arquitectura.md`: stack, carpetas, reglas de Next 16, permisos, diseño y cómo correrlo.
- `AGENTS.md`: Next 16 tiene cambios que rompen; la documentación de la versión instalada está en `node_modules/next/dist/docs/`.

## Reglas que no se negocian

- **Privacidad (Ley 25.326):**
  - Nunca mostrar el mail ni el DNI en público. El DNI no se guarda.
  - La matrícula se muestra solo si la profesional lo elige.
  - El perfil arranca privado.
  - El consentimiento es explícito.
  - Si algo choca con esto, se avisa en vez de resolverlo.
- **Permisos en el servidor, siempre:**
  - Cada página, acción de servidor y ruta llama a su guarda (`src/lib/auth/guardas.ts`).
  - Las consultas de institución filtran por el `institucionId` de la sesión.
- **Textos:**
  - Español rioplatense, con vos, directo y cálido.
  - Sin emojis ni tecnicismos.
  - Botones con verbos.
- **Accesibilidad AA:**
  - Etiquetas reales en los formularios.
  - Botones de 48 px.
  - Foco visible.
  - Errores asociados al campo.
- **Mobile first.** Probá siempre a 390 px de ancho, además de escritorio.
- **El verde se usa solo para lo verificado.** Lo que declara la profesional nunca lleva sello.
- **La marca** (nombre y logo) vive solo en `src/config/marca.ts` y `src/components/marca/`.
- **Datos de prueba inventados.** Nada de instituciones ni personas reales. Los mails van a `@demo.example`.

## Antes de dar algo por terminado

`npm run typecheck && npm run lint && npm test`. Si tocaste pantallas, también `npm run test:e2e`, y mirá capturas a 390 px y 1280 px.
