CREATE TABLE IF NOT EXISTS "invite" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"expires_at" timestamp,
	"oneTime" boolean
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invite" ADD CONSTRAINT "invite_channel_id_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
