CREATE TYPE "public"."jotAI" AS ENUM('rota_meter', 'cultivator', 'tAva', 'meDza', 'lohaDzI', 'super_seeder');--> statement-breakpoint
CREATE TYPE "public"."kaTAI_dhAn" AS ENUM('sAdA', '4x4', 'girA');--> statement-breakpoint
CREATE TYPE "public"."kaTAI" AS ENUM('dhAn', 'gehUM');--> statement-breakpoint
CREATE TABLE "bill" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"added_by_user_id" integer NOT NULL,
	"payment_complete" boolean DEFAULT false NOT NULL,
	"rate" integer NOT NULL,
	"total" integer NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"kaTAI_record" integer,
	"jotAI_record" integer,
	"trolley_record" integer
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"phone_number" varchar(13),
	"address" varchar(100),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "customer_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "jotAI_record" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "jotAI" NOT NULL,
	"kheta" integer NOT NULL,
	"chAsa" integer
);
--> statement-breakpoint
CREATE TABLE "kaTAI_record" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "kaTAI" NOT NULL,
	"kheta" integer NOT NULL,
	"dhAna_type" "kaTAI_dhAn"
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"bill_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"added_by_user_id" integer NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trolley_record" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bill" ADD CONSTRAINT "bill_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill" ADD CONSTRAINT "bill_added_by_user_id_user_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill" ADD CONSTRAINT "bill_kaTAI_record_kaTAI_record_id_fk" FOREIGN KEY ("kaTAI_record") REFERENCES "public"."kaTAI_record"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill" ADD CONSTRAINT "bill_jotAI_record_jotAI_record_id_fk" FOREIGN KEY ("jotAI_record") REFERENCES "public"."jotAI_record"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill" ADD CONSTRAINT "bill_trolley_record_trolley_record_id_fk" FOREIGN KEY ("trolley_record") REFERENCES "public"."trolley_record"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_bill_id_bill_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_added_by_user_id_user_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bill_customerIdx" ON "bill" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "bill_timestampIdx" ON "bill" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "bill_dateIdx" ON "bill" USING btree ("date");--> statement-breakpoint
CREATE INDEX "bill_paymentCompleteIdx" ON "bill" USING btree ("payment_complete");--> statement-breakpoint
CREATE INDEX "customer_uuidIdx" ON "customer" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "payment_billIdx" ON "payment" USING btree ("bill_id");--> statement-breakpoint
CREATE INDEX "payment_timestampIdx" ON "payment" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "payment_dateIdx" ON "payment" USING btree ("date");