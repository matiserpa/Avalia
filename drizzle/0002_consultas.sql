CREATE TABLE "consultas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"telefono" text,
	"organizacion" text,
	"ciudad" text,
	"mensaje" text,
	"acepto_privacidad_en" timestamp with time zone NOT NULL,
	"version_legales" text NOT NULL,
	"respondida_en" timestamp with time zone,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "consultas_fecha" ON "consultas" USING btree ("creada_en");--> statement-breakpoint
CREATE INDEX "consultas_email_fecha" ON "consultas" USING btree ("email","creada_en");