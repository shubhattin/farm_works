ALTER TABLE "bills" ADD COLUMN "date" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "date" timestamp with time zone NOT NULL;--> statement-breakpoint
CREATE INDEX "bills_date_index" ON "bills" USING btree ("date");--> statement-breakpoint
CREATE INDEX "payments_date_index" ON "payments" USING btree ("date");