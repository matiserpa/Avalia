# Despliegue

Cómo publicar la **demo** (para reuniones) y el **piloto** (con personas reales).

> **Sobre los precios y límites.** Se consultaron en octubre de 2026 en las páginas oficiales, pero a través de resúmenes de búsqueda: el entorno de trabajo no pudo abrirlas directamente. **Confirmalos en cada página antes de contratar.** Los marcados con "(confirmar)" tenían fuentes que no coincidían.

## Resumen

| Pieza | Piloto | Demo |
|---|---|---|
| Hosting | **Vercel Pro**, funciones en São Paulo (`gru1`) | Vercel, otro proyecto del mismo equipo |
| Base de datos | **Supabase Pro** en São Paulo (`sa-east-1`) | Otro proyecto de Supabase, aparte |
| Mails | **Resend** con dominio propio (`MAIL_MODE=resend`) | Bandeja en pantalla (`MAIL_MODE=bandeja`) |
| `DEMO_MODE` | `false` | `true` (sin base, en Vercel, no hace falta) |
| Dominio | El definitivo (va en los QR) | Un subdominio, por ejemplo `demo.<dominio>` |

Costo mensual aproximado del piloto: **US$ 45 a 65** (Vercel US$ 20 + Supabase US$ 25 + Resend gratis o US$ 20). Más el dominio y la marca, que se pagan una vez (ver abajo).

**Regla de oro:** la demo y el piloto nunca comparten base de datos, `AUTH_SECRET` ni dominio. En la demo cualquiera puede entrar como cualquiera (`/demo/entrar`) y el botón "Reiniciar los datos" **borra todo**.

## La demo en la web, en 5 minutos

Para verla desde cualquier navegador o celular, sin instalar nada. **Publicado en Vercel sin base de datos, el sitio es la demo sin cargar ninguna variable:** sin base no hay datos reales que cuidar. Se arma sola al arrancar: crea las tablas y carga los datos de prueba (todos inventados). Si falta `APP_URL`, toma la dirección que Vercel le da al proyecto. `DEMO_MODE=true` sigue sirviendo para la demo con base (abajo); `DEMO_MODE=false` la apaga.

1. En [vercel.com/new](https://vercel.com/new), entrar con la cuenta de GitHub e importar el repositorio `matiserpa/Avalia`.
2. Tocar **Deploy** (o **Deployments → Redeploy** si ya existía). No hace falta cargar variables.
3. Abrir `https://<el-proyecto>.vercel.app/demo`. La primera carga tarda unos segundos más, mientras arma la base.

**Sin base conectada, los datos viven en la memoria del servidor.** Alcanza para mostrar la demo, pero vuelven al estado inicial cada vez que Vercel arranca un servidor nuevo: después de un rato sin visitas, con cada despliegue y, a veces, con mucho tráfico (cada servidor tiene su copia). Para una demo con datos que no se reinicien:

4. En el proyecto, ir a **Storage**, crear una base **Neon** (Postgres) y conectarla al proyecto. Elegir la región São Paulo si aparece. Vercel carga sola la variable `DATABASE_URL`. Una base de Supabase conectada desde el mismo menú también sirve: carga `POSTGRES_URL`, que el código también lee.
5. En **Settings → Environment Variables**, agregar `DEMO_MODE` = `true`, marcando Production: con una base conectada, el sitio no es demo si no se pide (podría ser la base del piloto).
6. En **Deployments**, volver a desplegar el último (**Redeploy**).

Si el sitio muestra "Falta terminar de configurar el sitio", esa pantalla dice qué falta (sin mostrar ningún valor secreto). En la demo sin base, la única causa es que `DEMO_MODE` diga `false`; con base, que falte `DEMO_MODE=true`. Después de corregirlo hay que volver a desplegar. Si la primera carga da error, se recarga la página. Si los datos quedan raros, se usa el botón **Reiniciar los datos de la demo** de `/demo`.

La cadena de Neon trae `channel_binding=require` y la de Supabase trae `supa` y `pgbouncer`: el código los saca antes de conectarse (`urlDeLaBase` en `src/db/index.ts`). Si Vercel arranca varias copias del sitio a la vez con la base vacía, la primera la arma y las demás esperan (`conCandado` en `src/db/migrar.ts`).

**Si Vercel no publica los cambios nuevos.** En el plan gratis (Hobby), Vercel bloquea el despliegue automático de un commit cuyo autor no es la persona dueña del proyecto: en **Deployments** aparece como "Blocked" y "Redeploy" vuelve a publicar la versión anterior, no la nueva. Dos salidas:
- Publicar a mano la última versión: **Deployments → Create Deployment**, elegir la rama `main` y confirmar.
- Que los commits que van a `main` lleven como autor el mail de la cuenta de GitHub dueña del proyecto en Vercel.

**Dirección provisoria.** Mientras no haya dominio propio, el proyecto de Vercel puede usar una dirección gratis del tipo `algo.vercel.app`:
1. En el proyecto, **Settings → Domains → Add Domain**, escribir `avalya.vercel.app` y confirmar. Si está tomada, Vercel avisa: probar `avalya-demo.vercel.app` o `avalya-piloto.vercel.app`.
2. En **Settings → Environment Variables**, agregar `APP_URL` con esa dirección completa (por ejemplo `https://avalya.vercel.app`), para que los links, los QR y los PDF la usen.
3. **Deployments → Redeploy** del último despliegue.

La dirección anterior sigue andando. Cuando llegue el dominio propio, se cambia `APP_URL` y se vuelve a desplegar. Los QR que se hayan impreso con la dirección provisoria dejan de servir si esa dirección se da de baja, así que no se imprime nada con ella.

**En el iPhone, como una app.** Abrir la dirección en Safari, tocar el botón de compartir y elegir **Agregar a inicio**. Queda el ícono de Avalya en la pantalla de inicio y se abre sin la barra del navegador (`src/app/manifest.ts` y `src/app/apple-icon.tsx`). En Android, desde Chrome: menú y **Agregar a la pantalla principal**. La sesión de la app es aparte de la de Safari: la primera vez hay que entrar de nuevo.

Sobre el plan: Vercel considera comercial mostrarle la demo a clientes, y eso pide el plan Pro (ver "Hosting: Vercel"). Para mirarla internamente alcanza el gratis. Si después se agrega un dominio propio (`demo.<dominio>`), conviene definir `APP_URL` con esa dirección, para que los QR de la demo la usen.

Probado el 22/10/2026 con la compilación de producción: como en Vercel sin base y sin ninguna variable (en memoria) pasaron las 71 pruebas de punta a punta; contra un Postgres 16 y sin `APP_URL`, la demo se armó sola. También con una cadena como la de Neon (con `channel_binding`) y con tres copias del servidor arrancando a la vez sobre la base vacía: las tres respondieron y los datos se cargaron una sola vez.

## Antes del primer despliegue (una sola vez)

1. **Dominio.** Es el que va impreso en los QR para siempre: después no se cambia.
   - `.com.ar` en NIC Argentina: $ 8.500 por año (Resolución SLyT 5/2024; confirmar si se actualizó). Se tramita por TAD con CUIT o CUIL y clave fiscal nivel 2. Conviene que quede a nombre de la empresa titular de Avalya.
   - Si más adelante se compra un `.com`, **hay que seguir renovando el `.com.ar`** y redirigirlo, para que los QR viejos sigan funcionando.
2. **Marca en el INPI.** Desde mayo de 2026 el arancel se mide en UMAPI. Una clase con hasta 20 productos o servicios cuesta 100 UMAPI: unos $ 41.000 a 42.000 en octubre y noviembre de 2026 (confirmar). Los honorarios del agente van aparte.
   - Clase principal: **42**, software como servicio.
   - Conviene sumar la **35** (directorio y verificación de datos) y la **41** (formación); validar con un agente de marcas.
   - Desde el 1/3/2026 el INPI ya no busca marcas parecidas por su cuenta: hay que vigilar el Boletín de Marcas.
3. **Datos personales (AAIP).** La base de Avalya tiene que inscribirse en el Registro Nacional de Bases de Datos (Ley 25.326, artículo 21). Es gratis y no vence; se hace por TAD. Primero se inscribe la responsable (la empresa) y después la base. **Hacerlo antes de que entren personas reales.**
4. **Textos legales.** Que el abogado revise `/terminos` y `/privacidad` y complete lo marcado como [COMPLETAR]. Si los textos cambian, subir `VERSION_LEGALES` en `src/lib/legales.ts`.
5. **Logo de la marca.** Reemplazar `src/components/marca/Logo.tsx`. El nombre ya está en `src/config/marca.ts`.

## Base de datos: Supabase

- **Plan Pro (US$ 25 por mes).** El plan gratis se pausa después de 7 días con poca actividad (un piloto puede tener semanas quietas) y no garantiza cuántos días guarda los backups. Pro guarda backups diarios por 7 días. La recuperación a un momento exacto (PITR, desde US$ 100 por mes) no hace falta para el piloto.
- **Región São Paulo (`sa-east-1`).** Es la única de Sudamérica y no se puede cambiar después: hay que elegirla al crear el proyecto.
- **Conexión de la app:** el pooler (Supavisor) en **modo transacción, puerto 6543**. Ese modo no admite sentencias preparadas: el código ya usa `prepare: false` (`src/db/index.ts`). Esa cadena va en `DATABASE_URL`.
  - En Vercel, `DATABASE_POOL_MAX=1`: cada instancia de función abre su propio grupo de conexiones y el pooler las reparte.
  - La conexión directa de Supabase es sólo IPv6: no usarla desde Vercel.
- **Migraciones.** Con `DATABASE_URL` el servidor no migra solo (`src/instrumentation.ts`). Antes de publicar un cambio que toque `src/db/schema.ts`:
  ```bash
  npm run db:generar                                  # genera la migración en /drizzle (se sube al repo)
  DATABASE_URL="<pooler en modo sesión, puerto 5432>" npm run db:migrar
  ```
  Para migrar conviene el pooler en **modo sesión (puerto 5432)**, que tolera mejor los cambios de estructura.
  Las migraciones están en `/drizzle` y se aplican en orden; cada una corre una sola vez (Drizzle lleva la cuenta en la base).
- **Copias propias.** Además de los backups de Supabase, un `pg_dump` semanal guardado fuera de Supabase:
  ```bash
  pg_dump "<cadena en modo sesión>" --no-owner --format=custom -f avalya-$(date +%F).dump
  ```
- **Demo:** otro proyecto. Para cargar los datos de prueba:
  ```bash
  DEMO_MODE=true DATABASE_URL="<cadena de la base de la demo>" npm run db:migrar
  DEMO_MODE=true DATABASE_URL="<cadena de la base de la demo>" npm run demo:reiniciar
  ```
  Si la demo usa el plan gratis, **abrila el día anterior a cada reunión**: si estuvo pausada, se reactiva desde el panel de Supabase.

## Mails: Resend

1. Crear la cuenta y agregar el dominio. Resend recomienda un **subdominio** para enviar (por ejemplo `mail.<dominio>`).
2. Cargar en el DNS los registros que indica Resend:
   - **SPF:** un TXT y un MX en el subdominio `send`.
   - **DKIM:** un TXT con la clave.
   - **DMARC:** un TXT. Resend lo marca opcional, pero sin él más mails caen en spam: ponerlo.
3. Esperar la verificación (suele tardar unos 15 minutos).
4. Variables: `MAIL_MODE=resend`, `RESEND_API_KEY` y `MAIL_FROM="Avalya <hola@mail.<dominio>>"`.

**Límites:** el plan gratis manda 3.000 mails por mes y **100 por día**. Una emisión de más de ~90 certificados en un día (un congreso, por ejemplo) se pasa del tope. Los mails que no salen quedan marcados "No le llegó el mail" en el panel de la institución, que puede reenviarlos. Para emisiones grandes, el plan Pro (US$ 20 por mes, 50.000 mails, sin tope diario). El código manda por lotes de 100 (`src/lib/correo/enviar.ts`), que es el máximo de Resend por pedido.

## Hosting: Vercel

- **Plan Pro (US$ 20 por mes por cada persona que despliega).** El plan Hobby es sólo para uso personal y no comercial, y Vercel considera comercial un proyecto hecho por una agencia o consultora paga. Las personas que sólo miran (Viewer) son gratis.
- **Región `gru1` (São Paulo):** ya está fijada en `vercel.json`. Queda junto a la base, así cada consulta no viaja a Estados Unidos. Es la región más cara de Vercel, pero el tráfico del piloto es chico.
- **Límite de 4,5 MB por pedido.** Vercel rechaza cualquier pedido más grande con el error 413, y no se puede configurar. Por eso **las fotos se achican en el navegador antes de subirse** y el servidor acepta como máximo 4 MB (`src/lib/imagenes.ts`).
- **Next.js 16:** Vercel es un adaptador verificado por el equipo de Next. Node 22 o más nuevo (`engines` en `package.json`).
- **Archivos que se leen del disco** (tipografías del PDF y de las imágenes, migraciones): ya están incluidos con `outputFileTracingIncludes` en `next.config.ts`.
- **Variables de entorno:** se cargan por proyecto y por ambiente (Production y Preview). Después de cambiar una, hay que volver a desplegar. Si se usan los despliegues de prueba (Preview), también necesitan `APP_URL`, `DATABASE_URL` (mejor una base aparte) y `AUTH_SECRET`: sin ellas el sitio muestra un error en vez de arrancar mal.

### Alternativas

- **Netlify:** soporta Next 16 con el adaptador de OpenNext, pero todavía no es un adaptador verificado por Next. Tiene un límite parecido de unos 4,5 MB para subir archivos. No lo recomendamos por ahora.
- **Fly.io** (región São Paulo, desde ~US$ 4 por mes) corre `next start` en un servidor Node propio, sin el límite de 4,5 MB. Es la alternativa si alguna vez hiciera falta subir archivos grandes. Railway y Render no tienen regiones en Sudamérica.

## Variables de entorno

| Variable | Piloto | Demo | Para qué |
|---|---|---|---|
| `APP_URL` | `https://<dominio>` | `https://demo.<dominio>` | Va en los QR, los mails y las vistas previas. Sin barra final. **Definirla antes de emitir certificados reales.** |
| `DATABASE_URL` | Pooler de Supabase, modo transacción (6543) | Ídem, de la base de la demo | Sin ella se usa PGlite local (sólo para desarrollo). |
| `DATABASE_POOL_MAX` | `1` | `1` | Conexiones por instancia de función. |
| `AUTH_SECRET` | 48 caracteres al azar | Otro distinto | Firma códigos, sesiones y links. Se genera con `openssl rand -base64 48`. |
| `ADMIN_EMAILS` | Mails de Impulso, separados por coma | (opcional) | Quién entra a `/admin`. En la demo, `admin@demo.example` ya es admin. |
| `MAIL_MODE` | `resend` | `bandeja` | En el piloto es obligatorio `resend`: si falta o dice otra cosa, el sitio no manda mails y muestra un error (así nunca guarda en la base mails con códigos o links). |
| `RESEND_API_KEY` | La clave de Resend | — | |
| `MAIL_FROM` | `Avalya <hola@mail.<dominio>>` | — | |
| `DEMO_MODE` | `false` | `true` | **Nunca `true` en el piloto.** Si no se define, el sitio es demo sólo si está en Vercel sin base. |
| `CRON_SECRET` | 32 caracteres al azar | — | La usa la tarea diaria de `vercel.json` (`/tareas/diaria`), que borra las consultas del sitio de más de 12 meses. Sin ella, la tarea no corre. Se genera con `openssl rand -base64 32`. |
| `INDEXAR` | `true`, recién con el dominio definitivo | — | Deja indexar en buscadores la portada, `/profesionales`, `/contacto` y `/verificar` y arma `/sitemap.xml`. En la demo no tiene efecto. |

**Ojo con `AUTH_SECRET`:** cambiarlo cierra todas las sesiones y **deja sin efecto los links de activación que ya se mandaron** (se guardan firmados con ese secreto). Si hubiera que rotarlo durante el piloto, después reenviar los mails desde el panel de cada institución a quienes no activaron.

## Primer despliegue, paso a paso

1. Crear los dos proyectos de Supabase (piloto y demo) en São Paulo y copiar las cadenas de conexión.
2. Migrar las dos bases (`npm run db:migrar`) y cargar la demo (`npm run demo:reiniciar`), como se explica arriba.
3. Crear en Vercel dos proyectos desde el mismo repositorio: `avalya` (piloto) y `avalya-demo`. Cargar las variables de la tabla en cada uno.
4. Conectar los dominios: el definitivo al piloto y `demo.<dominio>` a la demo.
5. Configurar Resend con el dominio (sólo el piloto).
6. Desplegar. En el piloto, entrar a `/ingresar` con un mail de `ADMIN_EMAILS`: tiene que llegar el código.
7. **Prueba completa con un mail propio**, antes de invitar a nadie:
   - Desde `/admin`, crear una institución de prueba e invitarse.
   - Crear un curso, cargarse como egresada, emitir y recibir el mail.
   - Activar, armar el perfil, publicarlo y compartir el link por WhatsApp para ver la vista previa.
   - Escanear el QR del PDF con el celular: tiene que abrir `https://<dominio>/v/...` y decir "Certificado válido".
   - Después, anular ese certificado y borrar la cuenta de prueba.
8. Inscribir la base en la AAIP (si no se hizo) y recién ahí dar de alta las instituciones reales.

## Mantenimiento

- **Actualizaciones de seguridad.** El 14/10/2026 salió un parche de Next para fallas críticas: el proyecto ya está en Next 16.4.2 y sharp 0.35.5, las versiones corregidas. Correr `npm audit` y revisar el blog de Next antes de cada despliegue.
- **Antes de subir cambios:** `npm run typecheck && npm run lint && npm test`, y `npm run test:e2e` si se tocaron pantallas.
- **Si cambian los términos o la privacidad:** subir `VERSION_LEGALES` en `src/lib/legales.ts` y avisar por mail. Al volver a entrar, a cada profesional se le pide aceptar la versión nueva antes de usar su panel.
- **Si algo falla:** los registros de las funciones están en Vercel (Logs). El código no escribe datos personales en los registros.
- **Al cerrar el piloto:** decidir qué pasa con los datos (ver "Cuánto tiempo guardamos los datos" en `/privacidad`) y, si se da de baja, avisar con anticipación a las profesionales para que descarguen sus certificados.
