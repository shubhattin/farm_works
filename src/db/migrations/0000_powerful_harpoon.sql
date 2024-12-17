DO $$ BEGIN
 CREATE TYPE "jotAI" AS ENUM('rota_meter', 'cultivator', 'tAva', 'meDza', 'lohaDzI', 'super_seeder');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "kaTAI_dhAn" AS ENUM('sAdA', '4x4', 'girA');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "kaTAI" AS ENUM('dhAn', 'gehUM');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "user_type" AS ENUM('admin', 'non-admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"phone_number" varchar(13),
	"address" varchar(100),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jotAI_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "jotAI" NOT NULL,
	"kheta" integer NOT NULL,
	"chAsa" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kaTAI_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "kaTAI" NOT NULL,
	"kheta" integer NOT NULL,
	"dhAna_type" "kaTAI_dhAn"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"added_by_user_id" integer NOT NULL,
	"date" date NOT NULL,
	"rate" integer NOT NULL,
	"total" integer NOT NULL,
	"kaTAI_record" integer,
	"jotAI_record" integer,
	"trolley_record" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trolley_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"password_hash" char(96) NOT NULL,
	"user_type" "user_type" DEFAULT 'non-admin' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_kaTAI_record_kaTAI_records_id_fk" FOREIGN KEY ("kaTAI_record") REFERENCES "kaTAI_records"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_jotAI_record_jotAI_records_id_fk" FOREIGN KEY ("jotAI_record") REFERENCES "jotAI_records"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_trolley_record_trolley_records_id_fk" FOREIGN KEY ("trolley_record") REFERENCES "trolley_records"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
