ALTER TABLE "bill" ALTER COLUMN "rate" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "jotAI_record" ALTER COLUMN "kheta" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "jotAI_record" ALTER COLUMN "chAsa" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "kaTAI_record" ALTER COLUMN "kheta" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_maintainer" boolean;