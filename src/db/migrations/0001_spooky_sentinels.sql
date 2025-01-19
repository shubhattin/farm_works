ALTER TABLE "users" ADD COLUMN "user_id" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "super_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number");