CREATE TYPE "public"."jotAI" AS ENUM('rota_meter', 'cultivator', 'tAva', 'meDza', 'lohaDzI', 'super_seeder');--> statement-breakpoint
CREATE TYPE "public"."kaTAI_dhAn" AS ENUM('sAdA', '4x4', 'girA');--> statement-breakpoint
CREATE TYPE "public"."kaTAI" AS ENUM('dhAn', 'gehUM');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('admin', 'non-admin');--> statement-breakpoint
CREATE TABLE "bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"added_by_user_id" integer NOT NULL,
	"payment_complete" boolean DEFAULT false NOT NULL,
	"rate" integer NOT NULL,
	"total" integer NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"kaTAI_record" integer,
	"jotAI_record" integer,
	"trolley_record" integer
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"phone_number" varchar(13),
	"address" varchar(100),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "customers_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "jotAI_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "jotAI" NOT NULL,
	"kheta" integer NOT NULL,
	"chAsa" integer
);
--> statement-breakpoint
CREATE TABLE "kaTAI_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "kaTAI" NOT NULL,
	"kheta" integer NOT NULL,
	"dhAna_type" "kaTAI_dhAn"
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"bill_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trolley_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"phone_number" varchar(10) NOT NULL,
	"password_hash" varchar(96) NOT NULL,
	"user_type" "user_type" DEFAULT 'non-admin' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_kaTAI_record_kaTAI_records_id_fk" FOREIGN KEY ("kaTAI_record") REFERENCES "public"."kaTAI_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_jotAI_record_jotAI_records_id_fk" FOREIGN KEY ("jotAI_record") REFERENCES "public"."jotAI_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_trolley_record_trolley_records_id_fk" FOREIGN KEY ("trolley_record") REFERENCES "public"."trolley_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bills_customer_id_index" ON "bills" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "bills_timestamp_index" ON "bills" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "payments_bill_id_index" ON "payments" USING btree ("bill_id");--> statement-breakpoint
CREATE INDEX "payments_timestamp_index" ON "payments" USING btree ("timestamp");