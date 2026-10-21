# Arquitectura

## Stack

- **Next.js 16.4 (App Router) + React 19 + TypeScript + Tailwind v4.** Es un solo proyecto, con páginas, acciones y rutas que devuelven PDF o PNG.
- **Postgres con Drizzle ORM.**
  - Sin `DATABASE_URL` usa **PGlite**: Postgres corriendo dentro de Node, con los datos en `.data/pglite`. Se corre local sin instalar nada.
  - La conexión se abre en la primera consulta, no al importar `src/db`: Next importa las páginas también en procesos auxiliares, y dos PGlite sobre la misma carpeta la dañan.
  - Con `DATABASE_URL` usa **postgres-js**, por ejemplo contra Supabase en el piloto.
- **Ingreso propio, sin contraseñas.**
  - Código de 6 dígitos por mail (`src/lib/auth/codigos.ts`).
  - Links de activación (`src/lib/auth/activacion.ts`).
  - Sesión en una cookie httpOnly (`src/lib/auth/sesion.ts`).
- **Mails** (`src/lib/correo/`): por **Resend** en producción. En demo y desarrollo van a una **bandeja** en la base.
- **PDF** con `pdf-lib` y la tipografía Urbanist embebida (`src/lib/certificados/pdf.ts`). **QR** con `qrcode` (`src/lib/qr.ts`).
- **Imágenes:** las subidas se achican con `sharp` y se guardan en la base (`src/lib/imagenes.ts`). Las generadas (historia de Instagram, vista previa de links) se hacen con `ImageResponse` de `next/og`.

### Por qué no Supabase Auth ni Storage

El primer planteo era Supabase con autenticación y almacenamiento gestionados. Lo cambié porque:

1. **Se puede correr todo local** sin Docker ni cuentas. Una demo en una reunión no depende de internet ni de un servicio externo.
2. **Los mails los controlamos nosotros.** El mail integrado de Supabase solo manda al equipo y con un límite bajísimo, así que igual hacía falta un proveedor propio. Las plantillas quedan en español y con la marca.
3. **Las fotos y logos son pocos y chicos.** Guardarlos en la base evita un servicio más.

Supabase sigue siendo la opción recomendada para la **base del piloto**: es un Postgres gestionado y con backups.

## Carpetas

```
src/
  app/                    páginas, acciones de servidor y rutas (ver docs/producto.md)
  components/
    marca/Logo.tsx        logo e isotipo: se cambian cuando haya marca
    ui/                   componentes base: Boton, Campo, Tarjeta, Sello, Aviso, EstadoVacio, Avatar, ...
    layout/               PaginaPublica, MarcoPanel, TituloPagina, NavPanel, Pie
  config/marca.ts         nombre del producto y textos de marca
  db/                     schema.ts, conexión (index.ts), migraciones (migrar.ts)
  features/<area>/        consultas y lógica de cada área (publico, profesional, institucion, admin, demo)
  lib/                    auth, correo, certificados (código y PDF), qr, imagenes, eventos, texto, config
  fonts/                  Urbanist TTF (web, PDF e imágenes)
docs/                     producto, modelo de datos, arquitectura, despliegue
tests/unit/               Vitest (lógica, contra PGlite en memoria)
tests/e2e/                Playwright (celular y escritorio, contra un servidor con datos de demo)
scripts/                  migrar, reiniciar demo
```

## Reglas de Next 16 que usamos (esta versión cambió mucho)

La documentación oficial de la versión instalada está en `node_modules/next/dist/docs/`.

- **Sin `cacheComponents` ni `partialPrefetching`.** Todo se arma en cada pedido: el layout raíz llama a `connection()`. No hace falta `<Suspense>` para leer cookies o datos. No exportes `dynamic`, `revalidate` ni `runtime`.
- **`params` y `searchParams` son Promesas:**
  - En una página: `export default async function P({ params, searchParams }: PageProps<'/v/[codigo]'>) { const { codigo } = await params; ... }`.
  - En una ruta: `export async function GET(req: Request, ctx: RouteContext<'/img/[id]'>) { const { id } = await ctx.params }`.
  - Los tipos `PageProps`, `LayoutProps` y `RouteContext` son globales: los genera `npx next typegen`, que corre solo en `npm run typecheck` y en dev.
- **Cookies:** `await cookies()` permite **leer** en cualquier lado, pero **escribir** solo desde una acción de servidor o una ruta. Por eso `iniciarSesion()` y `cerrarSesion()` se llaman desde acciones o rutas.
- **Formularios:** acción de servidor (`'use server'`) con la firma `(estadoPrevio, formData)`, más `useActionState` de `react` en un componente cliente. El estado de "enviando" sale de `useFormStatus` de `react-dom` (`<BotonEnviar>` ya lo usa).
  - **Toda acción vuelve a chequear permisos** con su guarda, aunque la página ya lo haya hecho: una acción es un POST público.
  - `redirect()` va **fuera** de `try/catch`, porque funciona lanzando una excepción. Después de mutar datos que la página actual muestra, usá `revalidatePath(ruta)` o `refresh()` de `next/cache`.
  - El tamaño máximo del cuerpo es 10 MB (para fotos).
- **404 real:** `notFound()` de `next/navigation`, antes de devolver contenido. Cada carpeta puede tener su `not-found.tsx`.
- **`error.tsx`** es un componente cliente que recibe `{ error, retry }`. `retry` reemplaza a `reset`.
- **Middleware:** ahora se llama `proxy.ts`, pero **no lo usamos**. Los permisos se chequean en cada página, acción y ruta.
- **`ImageResponse`** se importa de `next/og`. Admite solo flexbox y fuentes TTF/OTF/WOFF. Leé `src/fonts/Urbanist-*.ttf` con `readFile(path.join(process.cwd(), 'src/fonts/...'))`.
- **Metadatos:** `export const metadata` o `generateMetadata` (no los dos). Por defecto todo es `noindex`; solo la portada se indexa.

## Permisos

Cada página, acción y ruta llama a una guarda de `src/lib/auth/guardas.ts`:

| Guarda | Devuelve | Si no corresponde |
|---|---|---|
| `requerirSesion()` | `{ usuario, perfil, esAdmin }` | va a `/ingresar` |
| `requerirProfesional()` | la sesión, con perfil y consentimiento | va a `/bienvenida` |
| `requerirInstitucion()` | la sesión + `institucionId` | va a `/ingresar?motivo=sin-permiso` |
| `requerirAdmin()` | la sesión | va a `/ingresar?motivo=sin-permiso` |

**Toda consulta de institución filtra por el `institucionId` de la sesión**, nunca por uno que venga del formulario. Toda consulta de profesional filtra por `usuario.id`.

Para leer la sesión sin redirigir (por ejemplo, para no contar la visita de la dueña), está `sesionActual()`.

## Datos y lógica

- Las consultas y la lógica de cada área van en `src/features/<area>/`, con `import 'server-only'` arriba.
- Las páginas no arman SQL: llaman funciones de ahí.
- Los nombres de dominio van en español, igual que el resto del código.

## Diseño

- **Tokens** en `src/app/globals.css`:
  - Colores: `marfil` (fondo), `crema` y `crema-claro` (superficies), `papel` (tarjetas y campos), `tinta` y `tinta-suave` (texto), `tierra` (acentos), `verde` (**solo** verificado), `error` y `borde`.
  - Los contrastes están verificados.
- **Tipografía:** Urbanist. El cuerpo va en 17 px.
- **Componentes base** (`src/components/ui/`). Usalos antes de crear otros:
  - `Boton`, `BotonLink`, `BotonEnviar`.
  - `Campo`, `AreaTexto`, `Selector`, `Casilla`.
  - `Tarjeta`, `Etiqueta`, `SelloVerificado`, `Aviso`, `EstadoVacio`.
  - `Avatar`, `LogoInstitucion`, `CopiarTexto`, `Icono`.
- **Estructuras de página:**
  - `PaginaPublica` (encabezado mínimo y pie).
  - `MarcoPanel` (encabezado con navegación y Salir; en el celular, navegación fija abajo).
  - `TituloPagina`.
- **El verde se usa solo para lo verificado.**

## Correr local

```bash
npm install
cp .env.example .env.local      # o crealo con DEMO_MODE=true
npm run dev                     # http://localhost:3000 (con DEMO_MODE=true carga los datos de prueba)
npm run demo:reiniciar          # borra la base (con PGlite, la carpeta entera) y vuelve a cargar la demo, con el servidor apagado
npm test                        # pruebas de lógica
npm run test:e2e                # pruebas de punta a punta (levanta su propio servidor)
npm run typecheck && npm run lint
```

En modo demo hay accesos directos que no piden código:
- `/demo/entrar?email=instituto@demo.example` (institución)
- `/demo/entrar?email=valentina.rios@demo.example` (profesional)
- `/demo/entrar?email=admin@demo.example` (admin)

`/demo/enlace?codigo=ML8D2F6N` abre un link de activación nuevo para el certificado de Martina López, que todavía no activó.

Los datos de prueba están en `src/lib/demo/semilla.ts`.
