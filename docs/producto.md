# AvalYa: producto

> **Nombre: AvalYa** (antes "Pasaporte Profesional" / "Avalia"). El "pasaporte" sigue siendo el nombre de lo que tiene cada profesional: "Activar mi pasaporte". Todavía no hay logo ni dominio: `avalya.com` está registrado por otra persona (octubre de 2026). El nombre se cambia en `src/config/marca.ts` y el logo en `src/components/marca/Logo.tsx`.

## Para qué sirve

Las profesionales de la estética (cosmetólogas, cosmiatras, dermatocosmiatras y médicas estéticas) se forman mucho, pero sus certificados quedan en PDFs o papeles que nadie ve.

- Las **instituciones** que forman emiten certificados digitales verificables.
- Cada **profesional** tiene un perfil con toda su formación, para compartir con pacientes, en el consultorio y en redes.
- **Cualquier persona** verifica un certificado escaneando el QR o escribiendo el código, sin crear cuenta.

### El piloto

Dura 3 meses, en Patagonia, con dos instituciones y decenas de personas. Queremos responder tres preguntas:

1. ¿Las profesionales activan su perfil y lo comparten? Se mide en las métricas del panel admin.
2. ¿Los pacientes o terceros verifican certificados? También se mide en las métricas.
3. ¿A las instituciones les sirve y lo recomendarían? Se responde con una entrevista al cierre, no dentro de la app.

## Usuarios

| Quién | Qué hace | Cómo entra |
|---|---|---|
| Institución emisora | Carga cursos y egresadas, y emite certificados | Mail + código de 6 dígitos. La invita el admin. |
| Profesional | Activa su pasaporte, completa el perfil, lo publica y lo comparte | Link del mail del certificado, o mail + código |
| Visitante o paciente | Ve un perfil o verifica un certificado | No necesita cuenta |
| Admin (Impulso) | Da de alta instituciones y mira las métricas | Mail + código. Su mail figura en `ADMIN_EMAILS`. |

**No hay contraseñas.** El link del certificado sirve para el primer ingreso; después se entra con un código por mail.

## Mapa de pantallas

### Público
| Ruta | Pantalla |
|---|---|
| `/` | Portada: qué es, verificar un código, contacto para instituciones |
| `/verificar` | Escribir un código a mano |
| `/v/[código]` | Verificación con tres estados: **válido**, **anulado** y **no encontrado** |
| `/p/[slug]` | Perfil público. Si el perfil es privado o no existe, se muestra el mismo mensaje en los dos casos. |
| `/terminos`, `/privacidad` | Textos legales. Son un **borrador para revisar con un abogado**. |
| `/ingresar` | Mail y después código. Es la misma pantalla para todos los roles. |

### Profesional
| Ruta | Pantalla |
|---|---|
| `/activar/[token]` | Llega desde el mail: ve su certificado, acepta términos y privacidad y activa |
| `/bienvenida` | Consentimiento, si entró por código, y después completar el perfil (una pantalla) |
| `/bienvenida/listo` | Vista previa del perfil con "Publicar mi perfil" o "Ahora no" |
| `/panel` | Mi pasaporte: estado del perfil, compartir y sus certificados con interruptor de visibilidad y PDF |
| `/panel/perfil` | Editar datos del perfil |
| `/panel/compartir` | Link corto, QR para imprimir e imagen para historias de Instagram |
| `/panel/cuenta` | Perfil público o privado, y borrar la cuenta |

### Institución
| Ruta | Pantalla |
|---|---|
| `/institucion` | Cursos con egresadas, emitidos y activados |
| `/institucion/cursos/nuevo` | Alta de curso |
| `/institucion/cursos/[id]` | Detalle del curso. Egresadas y su estado, con las acciones: reenviar, copiar link, anular. |
| `/institucion/cursos/[id]/cargar` | Carga de planilla: pegar filas o subir CSV, revisar y confirmar |
| `/institucion/cursos/[id]/emitir` | Confirmación de emisión con la lista de nombres y el certificado de muestra |

### Admin
| Ruta | Pantalla |
|---|---|
| `/admin` | Instituciones: alta con logo e invitación a la persona responsable |
| `/admin/metricas` | Métricas del piloto, por institución y por semana |

### Demo (solo con `DEMO_MODE=true`)
| Ruta | Pantalla |
|---|---|
| `/demo` | Guía del recorrido para la reunión, con accesos rápidos y botón para reiniciar los datos |
| `/demo/bandeja` | Los mails que "salieron", para mostrarlos en pantalla |

## Flujos

**Institución.**
1. Ingresa con código y crea un curso.
2. Carga la planilla, revisa y emite.
3. Mira quién activó. A quien no activó le reenvía el mail o le copia el link para mandarlo por WhatsApp.

**Profesional.**
1. Recibe el mail y toca "Activar mi pasaporte".
2. Ve su certificado y acepta términos y privacidad.
3. Completa el perfil, lo ve en la vista previa, lo publica y lo comparte.
4. Si otra institución le emite un certificado al mismo mail, aparece solo en su pasaporte. Si se lo emite a **otro** mail, abre ese link estando con la sesión iniciada y lo suma.

**Paciente.**
- Escanea el QR del certificado, ve "Certificado válido" y, si el perfil es público, toca "Ver toda la formación de María".
- También puede ir al revés: de la historia de Instagram al perfil, y del perfil a la verificación.

**Admin.** Da de alta la institución, invita a la responsable y mira las métricas.

### Recorrido de demo (2 minutos)
1. Instituto Demo emite los 5 certificados de "Congreso Demo 2026", que ya están cargados sin emitir.
2. Se abre el mail de Camila Sosa en la bandeja de prueba. Camila activa su pasaporte y publica su perfil.
3. Alguien escanea el QR de su certificado con el celular y ve "Certificado válido".

Además, Valentina Ríos (`/p/valentina-rios`) ya tiene un perfil completo para mostrar cómo queda.

## Decisiones tomadas (se pueden revisar)

Son las recomendaciones del análisis inicial, aplicadas por defecto.

1. **La verificación muestra el nombre de la titular aunque no haya activado su cuenta.** Es la función misma del certificado. El código es aleatorio e imposible de adivinar, y las páginas no se indexan en buscadores.
2. **Ocultar un certificado del perfil no lo invalida.** El código y el QR siguen verificando.
3. **Borrar la cuenta borra:** perfil, foto, contacto, sesiones, métricas, los códigos de ingreso y el registro de mails de ese mail. Los certificados quedan como registro de la institución, **desvinculados**, y siguen verificando. *A validar con el abogado.*
4. **La verificación aclara su alcance:** "Confirmamos que [institución] emitió este certificado. No reemplaza la matrícula profesional."
5. **El PDF acompaña al certificado de la institución, no lo reemplaza.** Usa un diseño estándar con el logo de la institución y no lleva DNI. **No guardamos DNI**: si la planilla lo trae, se ignora.
6. **El dominio sale de `APP_URL`**, y es el que va en los QR. Por ahora no hay dominio ni nada impreso: se define antes de emitir certificados reales en el piloto.
7. **Lo verificado y lo declarado se ven distintos.**
   - Verificado: los certificados que emitió una institución. Llevan sello verde.
   - Declarado por la profesional: profesión, ciudad, matrícula y contacto. No llevan sello, y la matrícula se rotula como "declarada".
8. **En el piloto nada se indexa en buscadores**, salvo la portada. Los perfiles se comparten por link.
9. **Las métricas no guardan IP, navegador ni cookies de seguimiento.**
   - No se cuentan las visitas de la propia profesional a su perfil o a sus certificados.
   - Tampoco se cuentan las de la institución emisora sobre sus certificados ni las del admin.
10. **Anular y volver a emitir.**
    - Un certificado emitido no se edita: si tiene un error, se anula (con motivo, que no se muestra en público).
    - La egresada vuelve a quedar "sin emitir", se corrige y se emite otro.

## Reglas de privacidad (Ley 25.326)

- Consentimiento explícito al activar la cuenta: casilla sin marcar, con links a términos y privacidad. Se guarda la fecha y la versión de los textos.
- El perfil arranca **privado**. Publicarlo es un paso explícito.
- **Nunca** se muestran en público el DNI (no lo guardamos) ni el mail.
- La matrícula se muestra solo si ella lo elige.
- La profesional puede borrar su cuenta desde `/panel/cuenta`.
- Lo que haga falta definir (responsable, domicilio, transferencias internacionales, inscripción ante la AAIP) va marcado como **[COMPLETAR]** en los textos legales.

## Tono y diseño

- Español rioplatense, con vos, directo y cálido.
  - Sin emojis ni tecnicismos: "verificar", no "validar el hash".
  - Botones con verbos: "Emitir 5 certificados", "Activar mi pasaporte", "Descargar PDF".
- Mobile first: la profesional y el paciente usan casi siempre el celular. El panel de institución piensa primero en escritorio, pero funciona en el celular.
- Se entiende sin explicación:
  - La profesional activa su pasaporte en menos de 2 minutos.
  - El paciente entiende la verificación de un vistazo.
- Accesible:
  - Contraste AA.
  - Etiquetas reales en los formularios.
  - Botones de 48 px.
  - Foco visible y navegación con teclado.
  - Mensajes de error asociados al campo.
- Confiable y premium, no administrativo: es algo que la profesional va a querer mostrar.
- Estados vacíos y errores pensados: perfil sin certificados, certificado no encontrado, mail que no llega, link vencido.

## Fuera de alcance

Pagos, app nativa, directorio con buscador, varios idiomas, blockchain e integración con ministerios.
