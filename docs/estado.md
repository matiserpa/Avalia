# Estado del proyecto y próximos pasos

*Nota de traspaso entre sesiones. Actualizala cada vez que termines una etapa.*

## Contexto

**Etapa actual: exploración de la idea.** El nombre es **Sella** (de "sello": lo verificado lleva sello). Antes fue "Pasaporte Profesional", "Avalia" y "AvalYa". Todavía no hay logo ni dominio: los dominios que se miraron están registrados por terceros y se está evaluando comprar uno. No se imprime nada todavía. Prioridad: un prototipo que se entienda en una reunión.

Lo arma Impulso Creativo, una agencia de Buenos Aires especializada en salud, estética y bienestar.

- **Piloto:** 3 meses en Patagonia, con dos instituciones aliadas.
  - Una asociación de cosmiatría.
  - Una formadora de Cipolletti con una formación de 9 meses y masterclasses.
- **El prototipo sirve para dos cosas:**
  1. Mostrárselo a las instituciones, para que entiendan la idea en 2 minutos.
  2. Correr el piloto real con decenas de personas.

Todo lo de producto está en `docs/producto.md`, el modelo en `docs/modelo-de-datos.md` y lo técnico en `docs/arquitectura.md`.

## Cómo quiere trabajar el cliente

- **Criterio de producto y diseño, no solo ejecución.** Si algo no tiene sentido o hay una forma más simple, se le dice.
- **Construir en este orden:** verificación pública → perfil público → panel de la profesional → panel de la institución → panel admin.
- **Capturas en celular (390 px) y escritorio (1280 px) en cada etapa.**
- **Privacidad:** si algo choca con la privacidad o con lo que se puede prometer en el piloto, **se avisa en vez de resolverlo solo**.
- **Repos:** no tocar `impulso-creativo-web` ni `CepatagoniaBackend`.

## Hecho (base, commit en `main`)

- Proyecto Next 16.4 + Tailwind v4 + Drizzle.
  - PGlite local, sin instalar nada.
  - Postgres en el piloto, vía `DATABASE_URL`.
- Modelo de datos completo y su migración (`drizzle/0000_inicial.sql`).
- **Ingreso sin contraseña:**
  - Código de 6 dígitos por mail.
  - Sesiones con cookie httpOnly.
  - Guardas de permisos por rol.
- **Activación:** links con token hasheado. Abrirlos no los gasta; el botón sí, y registra el consentimiento.
- **Mails:** Resend en producción, bandeja en la base para demo y desarrollo. Plantillas de código, certificado e invitación.
- **PDF del certificado:** A4 apaisado, Urbanist, logo de la institución, QR a `/v/<código>?c=qr` y marca de agua para las muestras.
- **Imágenes:** subida con achicado a WebP y ruta `/img/[id]`, que solo muestra fotos de perfiles públicos.
- **Base visual:**
  - Tokens de color con contrastes AA verificados.
  - Componentes base (`src/components/ui`).
  - Estructuras de página (`PaginaPublica`, `MarcoPanel`, `TituloPagina`).
- **Datos de demo inventados** (`src/lib/demo/semilla.ts`):
  - Instituto Demo con "Congreso Demo 2026" (5 egresadas sin emitir) y otros cursos.
  - Asociación Demo de Cosmiatría.
  - Valentina Ríos con su perfil público.
  - Un certificado anulado y métricas de ejemplo.
- **Rutas solo-demo:** `/demo/entrar?email=...` (entrar sin código) y `/demo/enlace?codigo=...` (link de activación nuevo).
- **Pantalla `/ingresar`** terminada.
- **Pruebas:**
  - Vitest con PGlite en memoria (`npm test`).
  - Configuración de Playwright para celular y escritorio (`npm run test:e2e`).

## Hecho (etapas 1 y 2)

- **Verificación pública** (`/verificar`, `/v/[código]`):
  - Estados válido (verde), anulado y no encontrado. Muestra "Consultado el …" por si sacan captura.
  - Aclaración de alcance: "No reemplaza la matrícula profesional".
  - Link al perfil sólo si es público **y** ella no ocultó ese certificado.
  - Nunca muestra el mail ni el motivo de una anulación.
- **Perfil público** (`/p/[slug]`, componente `VistaPerfil`, que también sirve para la vista previa de la profesional):
  - Formación agrupada por año con el logo de cada institución. Sello verde sólo en los certificados; matrícula rotulada "declarada".
  - Privado o inexistente: el mismo 404, con los mismos metadatos. La dueña ve el suyo con un aviso.
  - Vista previa para redes (`opengraph-image`): con datos sólo si el perfil es público; si no, la imagen genérica de la marca.
- **Portada** `/` (la única que se indexa), **legales en borrador** (`/terminos`, `/privacidad`, con lo que falta marcado como [COMPLETAR]), `not-found` y `error` globales.
- **Métricas:** `verificacion`, `verificacion_fallida` y `perfil_visita` con canal. No cuentan la dueña, la institución emisora (en verificaciones), la administración ni los programas que arman vistas previas de links (WhatsApp, Instagram…): se mira el navegador en el momento y no se guarda.
- **Arreglo de la base local:** la conexión se abre en la primera consulta (`src/db/index.ts`). Antes, los procesos auxiliares de Next abrían PGlite sobre la misma carpeta y la dañaban. `npm run demo:reiniciar` ahora borra la carpeta de PGlite y la crea de cero.
- **Pruebas:** de lógica (`tests/unit`) y de punta a punta (`tests/e2e`, celular y escritorio).

## Para confirmar con el cliente (surgió en las etapas 1 y 2)

- Los textos legales prometen cosas que hay que poder cumplir: que el piloto no tiene costo para las profesionales, que se avisa antes de cerrar el servicio para que descarguen sus certificados, y que si cambia la política se pide aceptarla de nuevo. Revisarlo con el abogado.
- La política de privacidad avisa que, al compartir el link, WhatsApp e Instagram pueden guardar una vista previa con nombre y foto. Es así y no depende de nosotros.

## Falta (en este orden)

3. **Panel de la profesional:**
   - `/activar/[token]`.
   - `/bienvenida`: consentimiento y perfil en una pantalla.
   - `/bienvenida/listo`: vista previa y Publicar.
   - `/panel`: certificados, visibilidad y PDF.
   - `/panel/perfil`.
   - `/panel/compartir`: link, QR para imprimir e imagen para historias de 1080×1920.
   - `/panel/cuenta`: público o privado, y borrar la cuenta.
4. **Panel de la institución:**
   - Cursos (alta y detalle).
   - Carga de egresadas: de a una, o pegando filas de la planilla, o con CSV.
   - Emisión: un certificado por egresada y mail con link. Si ya tiene cuenta, se le vincula directo.
   - Por certificado: estados, reenviar, copiar link para WhatsApp y anular con motivo.
   - PDF de muestra.
5. **Panel admin:** alta de instituciones con logo e invitación, y métricas del piloto (ver `docs/modelo-de-datos.md`).
6. **Demo:**
   - `/demo`: guía del recorrido de 2 minutos, accesos rápidos y reiniciar.
   - `/demo/bandeja`: los mails en pantalla.
7. **Revisión final:**
   - Privacidad y permisos.
   - Accesibilidad.
   - Textos (rioplatense, sin emojis ni tecnicismos).
   - Celular.
   - Prueba de punta a punta del recorrido de demo.
8. **`docs/despliegue.md`:**
   - Supabase (pooler, puerto 6543) y Resend con dominio propio.
   - Hosting:
     - Vercel Pro: el plan gratis no admite uso comercial.
     - Netlify: su integración con Next 16 no está verificada.
   - Variables de entorno.
   - Ambientes separados para demo y piloto.

## Decisiones aplicadas por defecto (pendientes de confirmación del cliente)

Están en `docs/producto.md`, sección "Decisiones tomadas". Resumen:

1. La verificación muestra el nombre aunque la profesional no haya activado.
2. Ocultar un certificado no lo invalida.
3. Borrar la cuenta deja los certificados desvinculados (a validar con el abogado).
4. La verificación aclara su alcance ("No reemplaza la matrícula profesional").
5. El PDF acompaña al de la institución, no lo reemplaza. No lleva DNI y el DNI no se guarda.
6. El dominio de los QR sale de `APP_URL`. Por ahora es una idea en exploración: **no hay dominio ni logo definidos** (el nombre ya es Sella) y no se va a imprimir nada todavía. No hace falta preguntarlo de nuevo: se define recién antes de emitir certificados reales en el piloto.

## Cambio de stack respecto de la propuesta inicial

Se propuso Supabase con Auth y Storage. Se usa Postgres (Supabase como host en el piloto) con ingreso y mails propios. El porqué está en `docs/arquitectura.md`. **Hay que contárselo al cliente al presentar la primera etapa.**

## Notas técnicas para seguir

- Antes de usar una API de Next, leé `AGENTS.md` y `node_modules/next/dist/docs/`: la versión 16.4 cambió mucho.
- Para correr varios servidores a la vez:
  - `NEXT_DIST_DIR` cambia la carpeta de compilación.
  - `PGLITE_DIR` cambia la base.
  - Playwright ya los usa (`E2E_PORT`, por defecto 3200).
- Capturas rápidas: `node scripts/captura.mjs <url> <archivo.png> [ancho] [alto]`. Usa Playwright y Chromium.
- Antes de cerrar cada etapa: `npm run typecheck && npm run lint && npm test`, y mirar las capturas.
