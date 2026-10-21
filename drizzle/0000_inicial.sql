CREATE TYPE "public"."estado_certificado" AS ENUM('valido', 'anulado');--> statement-breakpoint
CREATE TYPE "public"."tipo_curso" AS ENUM('formacion', 'masterclass', 'congreso', 'workshop');--> statement-breakpoint
CREATE TABLE "certificados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"egresada_id" uuid NOT NULL,
	"curso_id" uuid NOT NULL,
	"institucion_id" uuid NOT NULL,
	"titular_nombre" text NOT NULL,
	"titular_apellido" text NOT NULL,
	"email" text NOT NULL,
	"usuario_id" uuid,
	"activado_en" timestamp with time zone,
	"visible_en_perfil" boolean DEFAULT true NOT NULL,
	"estado" "estado_certificado" DEFAULT 'valido' NOT NULL,
	"emitido_en" timestamp with time zone DEFAULT now() NOT NULL,
	"anulado_en" timestamp with time zone,
	"motivo_anulacion" text,
	"mail_enviado_en" timestamp with time zone,
	"mail_error" text
);
--> statement-breakpoint
CREATE TABLE "codigos_ingreso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"codigo_hash" text NOT NULL,
	"intentos" integer DEFAULT 0 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"expira_en" timestamp with time zone NOT NULL,
	"usado_en" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "correos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"para" text NOT NULL,
	"asunto" text NOT NULL,
	"plantilla" text NOT NULL,
	"html" text,
	"texto" text,
	"estado" text NOT NULL,
	"error" text,
	"certificado_id" uuid,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cursos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institucion_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"tipo" "tipo_curso" NOT NULL,
	"carga_horaria" numeric(6, 1) NOT NULL,
	"fecha" date NOT NULL,
	"docente" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "egresadas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curso_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"email" text NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enlaces_activacion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificado_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"expira_en" timestamp with time zone NOT NULL,
	"usado_en" timestamp with time zone,
	CONSTRAINT "enlaces_activacion_tokenHash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text NOT NULL,
	"canal" text,
	"perfil_usuario_id" uuid,
	"certificado_id" uuid,
	"institucion_id" uuid,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "imagenes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mime" text NOT NULL,
	"datos" "bytea" NOT NULL,
	"ancho" integer NOT NULL,
	"alto" integer NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instituciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"ciudad" text,
	"logo_id" uuid,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "perfiles" (
	"usuario_id" uuid PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"profesion" text,
	"ciudad" text,
	"matricula" text,
	"mostrar_matricula" boolean DEFAULT false NOT NULL,
	"contacto_tipo" text,
	"contacto_valor" text,
	"foto_id" uuid,
	"publico" boolean DEFAULT false NOT NULL,
	"publicado_en" timestamp with time zone,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sesiones" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"usuario_id" uuid NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"expira_en" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"institucion_id" uuid,
	"acepto_legales_en" timestamp with time zone,
	"version_legales" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"ultimo_ingreso_en" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_egresada_id_egresadas_id_fk" FOREIGN KEY ("egresada_id") REFERENCES "public"."egresadas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_curso_id_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_institucion_id_instituciones_id_fk" FOREIGN KEY ("institucion_id") REFERENCES "public"."instituciones"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "correos" ADD CONSTRAINT "correos_certificado_id_certificados_id_fk" FOREIGN KEY ("certificado_id") REFERENCES "public"."certificados"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_institucion_id_instituciones_id_fk" FOREIGN KEY ("institucion_id") REFERENCES "public"."instituciones"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "egresadas" ADD CONSTRAINT "egresadas_curso_id_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enlaces_activacion" ADD CONSTRAINT "enlaces_activacion_certificado_id_certificados_id_fk" FOREIGN KEY ("certificado_id") REFERENCES "public"."certificados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_perfil_usuario_id_usuarios_id_fk" FOREIGN KEY ("perfil_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_certificado_id_certificados_id_fk" FOREIGN KEY ("certificado_id") REFERENCES "public"."certificados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_institucion_id_instituciones_id_fk" FOREIGN KEY ("institucion_id") REFERENCES "public"."instituciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instituciones" ADD CONSTRAINT "instituciones_logo_id_imagenes_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."imagenes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_foto_id_imagenes_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."imagenes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_institucion_id_instituciones_id_fk" FOREIGN KEY ("institucion_id") REFERENCES "public"."instituciones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "certificados_codigo_unico" ON "certificados" USING btree ("codigo");--> statement-breakpoint
CREATE INDEX "certificados_email" ON "certificados" USING btree ("email");--> statement-breakpoint
CREATE INDEX "certificados_usuario" ON "certificados" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "certificados_curso" ON "certificados" USING btree ("curso_id");--> statement-breakpoint
CREATE UNIQUE INDEX "certificados_egresada_valido" ON "certificados" USING btree ("egresada_id") WHERE estado = 'valido';--> statement-breakpoint
CREATE INDEX "codigos_email" ON "codigos_ingreso" USING btree ("email");--> statement-breakpoint
CREATE INDEX "correos_para" ON "correos" USING btree ("para");--> statement-breakpoint
CREATE INDEX "cursos_institucion" ON "cursos" USING btree ("institucion_id");--> statement-breakpoint
CREATE UNIQUE INDEX "egresadas_curso_email" ON "egresadas" USING btree ("curso_id","email");--> statement-breakpoint
CREATE INDEX "eventos_tipo_fecha" ON "eventos" USING btree ("tipo","creado_en");--> statement-breakpoint
CREATE UNIQUE INDEX "perfiles_slug_unico" ON "perfiles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sesiones_usuario" ON "sesiones" USING btree ("usuario_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_email_unico" ON "usuarios" USING btree ("email");