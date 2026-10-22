# Estado del proyecto y próximos pasos

*Nota de traspaso entre sesiones. Actualizala cada vez que termines una etapa.*

## Contexto

**Etapa actual: exploración de la idea.** El nombre es **Avalya** (con "y"), provisorio: la marca (nombre, logo y estilo) se define más adelante. Antes se probaron "Pasaporte Profesional", "AvalYa", "Sella" y "Avalia". Todavía no hay logo ni dominio: los dominios que se miraron están registrados por terceros y se está evaluando comprar uno. No se imprime nada todavía. Prioridad: un prototipo que se entienda en una reunión.

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

## Hecho (etapa 3: panel de la profesional)

- `/activar/[token]`: muestra el certificado; activa sólo con la casilla de términos y privacidad tildada (error asociado al campo). Si quien abre el link ya tiene su pasaporte con otro mail, ofrece "Sumar a mi pasaporte".
- **Seguridad:** un link de activación deja de servir para entrar en cuanto el certificado queda en una cuenta (`consultarEnlace`). Así un link viejo, por ejemplo uno que la institución mandó por WhatsApp, no abre la cuenta de nadie.
- `/bienvenida` (consentimiento, si entró con código, y perfil en una pantalla) y `/bienvenida/listo` (vista previa con "Publicar mi perfil" o "Seguir sin publicar").
- `/panel`: estado del perfil, link, certificados con interruptor "Mostrar en mi perfil" y descarga del PDF (registra `pdf_descarga`). Los anulados se listan aparte.
- `/panel/perfil`: foto (se achica a WebP; la anterior se borra), profesión, ciudad, matrícula (con "Mostrarla en mi perfil"), contacto por WhatsApp o Instagram.
- `/panel/compartir`: link para copiar o compartir, QR para imprimir (sólo la tarjeta) o descargar en PNG, e imagen para historias de 1080×1920. Cada acción registra `compartir` con su canal.
- `/panel/cuenta`: público o privado, y borrar la cuenta (`src/features/profesional/cuenta.ts`). Al borrar, además, los links de activación sin usar de sus certificados dejan de servir.
- `/demo/enlace?email=...` además de `?codigo=...`.
- El código de demo de Martina pasó a `MK8D2F6N`: el anterior tenía una L, que no existe en el alfabeto de los códigos y nunca se encontraba.

## Hecho (etapa 4: panel de la institución)

- `/institucion`: cursos con egresadas, emitidos y activados. `/institucion/cursos/nuevo`: alta con validación (carga horaria con coma, fecha).
- `/institucion/cursos/[id]`: resumen, egresadas con su estado (sin certificado, mail enviado, no le llegó el mail, activó) y acciones:
  - Con certificado: reenviar mail, copiar link (sólo si no activó; con botón para WhatsApp) y anular con motivo interno.
  - Sin certificado: corregir datos y quitar (si nunca se le emitió nada).
  - Agregar una egresada de a una.
- `/institucion/cursos/[id]/cargar`: pegar filas de Excel o Google Sheets, o subir un CSV (coma o punto y coma). Reconoce encabezados ("Apellido y nombre", "Correo"…), separa nombre y apellido, capitaliza, marca errores por fila y **descarta el DNI**. Se revisa antes de confirmar. Lógica en `src/features/institucion/planilla.ts`.
- `/institucion/cursos/[id]/emitir`: confirmación con la lista de nombres y el certificado de muestra (`/muestra`, con marca de agua). Si la egresada ya tiene su pasaporte con ese mail, el certificado se suma directo y el mail la invita a entrar, sin link de activación.
- Toda consulta filtra por el `institucionId` de la sesión (`src/features/institucion/`); hay pruebas de que una institución no ve ni toca lo de otra.

## Hecho (etapa 5: panel admin)

- `/admin`: instituciones con sus cursos, certificados emitidos y equipo. Alta con nombre, ciudad, logo (obligatorio: va en cada certificado) y mail de la responsable, que recibe una invitación. "Sumar a otra persona" para invitar a más gente del equipo. No suma un mail que ya es de una profesional, de otra institución o de la administración.
- `/admin/metricas` (`src/features/admin/metricas.ts`): filtro de período (4 u 8 semanas o todo el piloto) e institución, en una fila arriba de todo.
  - ¿Activan y comparten?: certificados emitidos, activación con medidor (activadas / personas con certificado), perfiles públicos y perfiles que compartieron.
  - ¿Los pacientes miran y verifican?: visitas y verificaciones (más las fallidas), por semana (lunes a domingo, hora argentina).
  - Por dónde llegan: barras por canal de visitas, verificaciones y de cómo comparten.
  - Tabla por institución.
- Gráficos en HTML y CSS (`src/components/graficos/`), con un solo color (`--color-dato`, validado: el verde queda para lo verificado), valor de cada marca con el mouse o el teclado, y "Ver como tabla" en cada uno.
- Arreglo: los conteos de la lista de cursos (etapa 4) daban 0. En el `select` de una sola tabla, Drizzle escribe las columnas sin la tabla y la subconsulta tomaba la suya. Ahora la columna de afuera va escrita entera, con pruebas.

## Hecho (etapa 6: demo)

- `/demo`: el recorrido de 2 minutos en tres pasos, con el estado de cada uno ("Hecho"), el QR del certificado de Camila para escanear, "Para mostrar además" (perfil completo, cómo comparte una profesional, métricas), "Entrar como…" y "Reiniciar los datos de la demo".
- `/demo/bandeja`: los mails en pantalla. Cada mail se muestra aislado del sitio (sin scripts) y sus links abren en la misma pestaña, como desde el mail.
- Prueba de punta a punta del recorrido completo (`tests/e2e/demo.spec.ts`).
- **Para escanear el QR con un celular, el sitio tiene que estar publicado** (`APP_URL` con un dominio): con la demo en una compu (`localhost`), el celular no llega. La guía lo avisa y ofrece abrir la verificación en la compu.

## Hecho (etapa 7: revisión final)

Seis frentes revisados en paralelo (privacidad, permisos, accesibilidad, textos, celular y lógica), con código y pantallas reales, y cada hallazgo verificado por separado. Lo que se arregló:

- **Seguridad:**
  - Una institución podía abrir la cuenta de otra institución, o la de la administración, emitiendo un certificado a ese mail y usando el link para WhatsApp. Ahora esos mails no se pueden cargar como egresadas, y su link nunca abre la cuenta: entran sólo con código (`esCuentaReservada` en `src/lib/auth/activacion.ts`).
  - El límite de 5 intentos por código se salteaba con pedidos simultáneos. Ahora cada intento se cuenta antes de comparar, en una sola sentencia.
  - Redirección abierta en `/demo/entrar`.
- **Privacidad:**
  - Pedir códigos ya no revela si un mail está en la plataforma: la respuesta es siempre la misma y el mail sale después de responder.
  - El DNI podía quedar guardado como apellido en una planilla sin encabezados. Ahora una columna de documentos se ignora aunque alguna celda diga "s/d", y un nombre con números no se carga.
  - El link del perfil podía armarse con la parte del mail antes de la @. Ahora nunca usa el mail, y sigue al nombre hasta la primera publicación.
  - Si cambia `VERSION_LEGALES`, a cada profesional se le pide aceptar los textos nuevos antes de usar su panel (`consentimientoVigente`).
  - En el piloto, sin `MAIL_MODE=resend` no sale ningún mail, así no queda guardado el cuerpo de los mails en la base. Sin `APP_URL` (o, en Vercel, sin `DATABASE_URL`) el sitio avisa con un error claro.
- **Accesibilidad:**
  - Al volver con errores, el foco va al primer campo con error (o al aviso).
  - Todos los botones miden 48 px.
  - Foco visible en el campo de "Copiar".
  - Las barras fijas (arriba y abajo) no tapan el foco.
  - Los gráficos ya no tienen carteles flotantes que tapan datos.
  - Contraste del texto de ejemplo, títulos de página, jerarquía de títulos y nombre accesible del logo.
- **Textos:**
  - Botones con verbo: "Crear un curso", "Crear link para WhatsApp", "Seguir sin publicar".
  - Nada de "te llega un mail": decimos "te mandamos un mail".
  - "No pudimos mandar el mail".
  - "formación verificada" sólo si hay certificados a la vista.
  - Singular y plural; "e" antes de i; "Taller" en vez de "Workshop" y un tipo nuevo "Jornada" (migración `drizzle/0001_tipo_jornada.sql`).
  - Fecha del curso escrita en palabras para revisar día y mes.
  - Campos para subir archivos en castellano.
- **Lógica:**
  - CSV de Excel en Windows (Windows-1252) sin romper tildes.
  - Apellidos con apóstrofo ("D'Angelo").
  - Los formularios ya no pierden lo escrito cuando vuelven con errores.
  - La emisión no se traga errores y no emite si la lista cambió mientras se revisaba.
  - "1.200" horas son mil doscientas.
  - Las fechas imposibles se rechazan.
  - Las métricas cuentan a cada persona una vez.
- **Celular:**
  - Las fotos y los logos se achican en el navegador antes de subirse: Vercel corta en 4,5 MB. Si se toca "Guardar" mientras se achica la foto, el envío espera.
  - El link de la profesional se ve completo.
  - Los botones de dos renglones quedan centrados.
- **Pruebas:** `tests/unit/seguridad.test.ts` cubre cada arreglo de seguridad, privacidad y lógica (la de intentos simultáneos falla con el código anterior).

## Hecho (etapa 8: despliegue)

- `docs/despliegue.md`: Supabase (pooler en modo transacción, puerto 6543; migraciones por el puerto 5432), Resend con dominio propio (SPF, DKIM y DMARC; tope de 100 mails por día en el plan gratis), Vercel Pro en São Paulo, variables de entorno, ambientes separados de demo y piloto, primer despliegue paso a paso, costos y mantenimiento.
- `vercel.json` con la región `gru1`, `engines` en `package.json` y límite de 4 MB por imagen en el servidor. Los SVG se aceptan sólo para logos y siempre se convierten a WebP.
- Primer despliegue real de la demo (proyecto `avalia-demo` en Vercel): sin base conectada mostraba un error genérico en inglés. Ahora, si falta configuración, todas las páginas muestran "Falta terminar de configurar el sitio" con lo que falta (`faltaConfigurar` en `src/lib/config.ts`). Además se corrigieron dos fallas que iban a aparecer al conectar Neon: su cadena trae `channel_binding`, que Postgres rechaza, y dos copias arrancando juntas chocaban al armar la base (ahora hay un candado). Pruebas en `tests/unit/configuracion.test.ts`.
- Se puede agregar a la pantalla de inicio del celular y se abre como app: ícono propio (`src/components/marca/IconoApp.tsx`), `src/app/manifest.ts` y `src/app/apple-icon.tsx`. Cómo hacerlo, en `docs/despliegue.md`.

## Hecho (sitio comercial y nombre Avalya)

- El nombre pasa a ser **Avalya** (con "y").
- **Sitio comercial** en `src/app/(comercial)/`: portada para instituciones (`/`), `/profesionales` y `/contacto`, con su encabezado (menú en el celular) y su pie. La estructura y los textos salieron de tres propuestas (conversión, confianza y mirada de redes) y un juez; las reglas, en `docs/producto.md` ("Sitio comercial").
- **Formulario de contacto** con la tabla `consultas`, aviso por mail a la agencia y `/admin/consultas`. En la demo no guarda nada. La política de privacidad suma los datos del formulario (`VERSION_LEGALES` subió: las profesionales vuelven a aceptar).
- `/verificar` suma "Cómo leer el resultado" y "Lo que tenés que saber".
- `INDEXAR`: mientras la dirección sea provisoria no se indexa nada (antes la portada sí).
- Pruebas: `tests/unit/consultas.test.ts` y `tests/e2e/sitio.spec.ts`.
- **La demo publicada ya no necesita base:** sin `DATABASE_URL`, con `DEMO_MODE=true`, usa una base en memoria que se arma sola (vuelve al estado inicial cuando Vercel arranca un servidor nuevo). Con Neon conectado, los datos quedan fijos.

## Para confirmar con el cliente (sitio comercial)

1. **La dirección provisoria muestra la demo**, donde el formulario no guarda nada. Para recibir consultas reales hace falta el proyecto del piloto (base, Resend, `AUTH_SECRET`, `APP_URL`).
2. **Datos del responsable** (razón social, CUIT y domicilio de Impulso Creativo) para el aviso del formulario y `/privacidad`, y si la inscripción en la AAIP cubre la base de consultas. Sin esto no conviene publicar el formulario con datos reales.
3. **El aviso por mail de cada consulta lleva todos los datos**: la copia queda en el correo de la agencia más allá de los 12 meses, y la agencia se compromete a borrarla. La alternativa es que lleve sólo el tipo, la institución y el link a `/admin/consultas`.
4. **Plan de Resend** antes de emitir para un congreso grande: el gratis manda 100 mails por día.
5. **El kit para egresadas y la campaña de inscripción**: ¿se ofrecen en el piloto y cómo se presupuestan? El sitio sólo dice que son opcionales.
6. **"Verificar es gratis siempre"**: ¿lo asume la agencia por escrito, en los términos?
7. **El pie propuesto para el PDF** (ver "Para confirmar con el cliente (surgió en la revisión final)").
8. ~~Datos de la demo con formato real~~: hecho. Matrícula "MP 0000", Instagram "demo.avalya", Agustina sin contacto y ejemplos de mail con example.com (dominio reservado).
9. **La frase para la promoción** («Los certificados de nuestros cursos se pueden verificar») vale sólo para los cursos emitidos con Avalya: dejarlo escrito en el acuerdo con cada institución.
10. **Capacidad para atender** las consultas, las reuniones y las altas de instituciones nuevas durante el piloto.
11. **Colegios profesionales**: el formulario dice "asociación profesional" para no mezclar a Avalya con quien otorga la matrícula. ¿Son un público buscado?

## Falta

- Lo de "Antes del primer despliegue" en `docs/despliegue.md`: dominio, marca en el INPI, inscripción en la AAIP, revisión legal y logo.

## Para confirmar con el cliente (surgió en las etapas 3 a 6)

- **Sumar un certificado de otro mail:** si a una profesional con cuenta le llega por error el link de otra persona, podría sumarlo. Hoy el perfil lo muestra con "A nombre de …". Alternativa más estricta: exigir que el nombre coincida (complica a quien cambió de apellido).
- **El link que la institución copia para WhatsApp es una llave de entrada** hasta que la profesional activa: sirve una vez, vence a los 45 días y deja de servir al activar. Conviene que las instituciones no lo manden a grupos.

## Para confirmar con el cliente (surgió en la revisión final)

- **Quien abre el link para WhatsApp acepta los términos en nombre de la profesional.** La institución ve ese link: alguien de la institución podría activar el pasaporte de una egresada, y de paso ver los certificados que otras instituciones le emitieron a ese mismo mail. Para el piloto, con dos instituciones aliadas, propongo dejarlo como está y sumar al acuerdo con cada institución que ese link es sólo para la egresada. Para después del piloto, la alternativa es que activar con un link compartido pida además un código por mail (con el costo de que no sirve si el mail estaba mal escrito, que es justo cuando se usa WhatsApp).
- **El PDF dice "CERTIFICADO" y "Se certifica que…"** y no aclara que acompaña al certificado de la institución ni que no reemplaza la matrícula (la verificación sí lo aclara). Propuesta para validar con el abogado: sumar al pie "Copia digital emitida por {institución} con Avalya. Acompaña al certificado de la institución y no reemplaza la matrícula profesional."
- **Las sesiones duran 30 días** desde que se ingresa; después se pide un código nuevo. No se renuevan solas.
- **Tipos de curso:** se agregó "Jornada" y "Workshop" se muestra como "Taller". Confirmar que así lo llaman las instituciones.

## Decisiones aplicadas por defecto (pendientes de confirmación del cliente)

Están en `docs/producto.md`, sección "Decisiones tomadas". Resumen:

1. La verificación muestra el nombre aunque la profesional no haya activado.
2. Ocultar un certificado no lo invalida.
3. Borrar la cuenta deja los certificados desvinculados (a validar con el abogado).
4. La verificación aclara su alcance ("No reemplaza la matrícula profesional").
5. El PDF acompaña al de la institución, no lo reemplaza. No lleva DNI y el DNI no se guarda.
6. El dominio de los QR sale de `APP_URL`. Por ahora es una idea en exploración: **no hay dominio ni logo definidos** (el nombre ya es Avalya) y no se va a imprimir nada todavía. No hace falta preguntarlo de nuevo: se define recién antes de emitir certificados reales en el piloto.

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
