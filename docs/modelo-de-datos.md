# Modelo de datos

La fuente de verdad es `src/db/schema.ts` (Drizzle). Las migraciones están en `/drizzle`: se generan con `npm run db:generar` y se aplican con `npm run db:migrar`, o solas al arrancar si se usa PGlite.

```
instituciones ─┬─< usuarios (personas de la institución: institucion_id)
               ├─< cursos ─< egresadas ─< certificados >─ usuarios (profesional dueña)
               └─< certificados                    └─< enlaces_activacion

usuarios ─┬── perfiles (1 a 1, solo profesionales)
          ├─< sesiones
          └─< eventos (métricas del perfil)

codigos_ingreso   (por mail, antes de que exista o se identifique la cuenta)
correos           (registro de mails; en demo, bandeja en pantalla)
consultas         (formulario de contacto del sitio comercial)
imagenes          (logos y fotos, en la base)
```

## Tablas

### `instituciones`
Nombre, ciudad y logo. Las crea el admin.

### `usuarios`
Toda persona que ingresa. El mail se guarda **en minúsculas** y es único.

- `institucion_id`: si no es null, la persona es del equipo de esa institución y entra a su panel.
- `acepto_legales_en` y `version_legales` guardan el **consentimiento** (Ley 25.326). Mientras sean null, la profesional no puede usar el panel.
- Quién es admin no se guarda acá: lo define la variable `ADMIN_EMAILS`.

### `perfiles`
Solo para profesionales, uno por usuario.

- **`slug`**: es el link corto, por ejemplo `/p/valentina-rios`. Es único.
- **Datos declarados por ella:** nombre, apellido, profesión, ciudad, matrícula (y `mostrar_matricula`), contacto y foto.
- **`publico`**: arranca en `false`. `publicado_en` registra cuándo lo publicó por primera vez.

### `cursos`
- **`tipo`:** `formacion`, `masterclass`, `congreso`, `jornada` o `workshop` (se muestra como "Taller").
- **`carga_horaria`:** en horas, admite decimales.
- **`fecha`:** la de realización o finalización. Es la que figura en el certificado.
- **`docente`:** docente o disertante.

Una vez emitido algún certificado, el curso **no se edita**, para que el certificado no cambie después.

### `egresadas`
Las personas cargadas en un curso, con nombre, apellido y mail. Son únicas por curso y mail.

**No hay DNI.**

### `certificados`
El certificado emitido.

- **`codigo`:** 8 caracteres en base 32 de Crockford. Se muestra como `XXXX-XXXX`, es aleatorio y es único.
- **Copia de datos al emitir:** `titular_nombre`, `titular_apellido` y `email`.
- **`usuario_id`:** la profesional dueña, cuando tiene cuenta. Si borra la cuenta, vuelve a null y el certificado sigue verificando.
- **`visible_en_perfil`:** ocultarlo no lo invalida.
- **`estado`:** `valido` o `anulado`, con fecha y motivo. El motivo es interno.
- **Mail de activación:** `mail_enviado_en` y `mail_error` registran el último envío.
- **Restricción:** una egresada tiene **un solo certificado válido** por curso (índice único parcial). Los anulados quedan como historial.

### `enlaces_activacion`
Los links de "Activar mi pasaporte" del mail, y los que la institución copia para mandar por WhatsApp.

- Se guarda solo el **hash** del token.
- Vencen a los 45 días y sirven una sola vez.
- Abrir el link no activa nada: activa el botón, que además registra el consentimiento. Así, los antivirus que abren los links solos no lo gastan.

### `codigos_ingreso`
El código de 6 dígitos por mail:

- Se guarda hasheado con un secreto.
- Dura 10 minutos y admite 5 intentos.
- Se permiten como máximo 5 por hora, con un minuto de espera entre uno y otro.

### `sesiones`
Cookie httpOnly con token aleatorio; en la base solo está su hash. Dura 30 días.

### `eventos`
Las métricas del piloto. Guardan qué pasó (`tipo`), por qué canal (`canal`) y sobre qué (perfil, certificado, institución). **Sin IP, sin navegador, sin cookies de seguimiento.**

| tipo | cuándo |
|---|---|
| `perfil_visita` | Alguien abre un perfil público (no cuenta la dueña) |
| `verificacion` | Alguien abre la verificación de un certificado (no cuentan la dueña, la institución ni el admin) |
| `verificacion_fallida` | Alguien escribe un código que no existe |
| `compartir` | La profesional toca copiar, compartir o descargar el QR o la imagen. El canal dice cuál. |
| `pdf_descarga` | La profesional descarga el PDF de un certificado |
| `perfil_publicado` | Publica su perfil por primera vez |
| `cuenta_activada` | Acepta términos y privacidad por primera vez |

**Canales** (el parámetro `?c=` de los links):
- Visitas y verificaciones: `qr`, `historia`, `link`, `codigo`, `perfil`, `verificacion`, `directo`.
- Compartir: `copiar_link`, `compartir_nativo`, `qr_consultorio`, `imagen_historia`.

### `correos`
El registro de cada mail. Sirve para responder al "no me llegó": muestra si salió y si el proveedor lo rechazó.

- **En modo `bandeja`** (demo y desarrollo) guarda también el cuerpo, y así se muestra en `/demo/bandeja`.
- **En producción no guarda el cuerpo**, porque lleva links de ingreso.

### `imagenes`
Logos y fotos, achicados a 512 px en WebP y guardados en la base. Se sirven por `/img/[id]`:

- Los logos son públicos.
- Una foto es pública solo si su perfil está publicado. Si no, la ven solo su dueña y el admin.

### `consultas`
Lo que llega desde el formulario de contacto del sitio comercial (`/contacto`): tipo (instituto, asociación, congreso, profesional u otro), nombre, mail, teléfono, institución, ciudad y mensaje. Guarda cuándo aceptó el aviso de privacidad y la versión de los textos legales.

- **Se borran solas a los 12 meses** de llegar, como dice la política de privacidad: lo hace una tarea diaria (`vercel.json` → `/tareas/diaria`, con `CRON_SECRET`) y, además, cada vez que llega una consulta o se abre el panel. Desde `/admin/consultas` se marcan como respondidas o se borran antes.
- **El aviso por mail** lleva los datos y se responde directo a quien escribió, pero en `correos` queda sólo "Consulta nueva (tipo)", sin datos de la persona. Después de 10 avisos en el día, las consultas se guardan sin aviso, para no agotar el cupo de mails que necesitan los códigos de ingreso.
- **Contra el spam:** un campo trampa invisible, hasta 3 por mail por día y hasta 20 por hora en total.
- **En modo demo no se guarda nada:** el panel de administración de la demo lo puede abrir cualquiera.

## Qué se borra al borrar una cuenta

| Dato | Qué pasa |
|---|---|
| Perfil, foto, contacto, matrícula | Se borra |
| Sesiones, códigos de ingreso, registro de mails de ese mail | Se borra |
| Eventos de su perfil (visitas, compartidos, activación) | Se borra |
| Certificados | **Quedan**, desvinculados (`usuario_id = null`), y siguen verificando. Son registro de la institución. *A validar con el abogado.* |
| Egresada en el curso | Queda (es la carga de la institución) |

## Métricas del piloto (panel admin)

- **Certificados emitidos:** `certificados` válidos.
- **Perfiles activados:** usuarios con `acepto_legales_en`. La tasa es activadas / personas distintas con certificado.
- **Perfiles públicos:** `perfiles.publico`.
- **Perfiles compartidos:** perfiles distintos con al menos un evento `compartir`. El desglose va por canal.
- **Visitas a perfiles:** eventos `perfil_visita`, por canal.
- **Verificaciones:** eventos `verificacion`, por canal (QR, código, desde el perfil), más las fallidas.
