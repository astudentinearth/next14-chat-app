ALTER TABLE "message" RENAME COLUMN "text" TO "sender_username";--> statement-breakpoint
ALTER TABLE "message" DROP CONSTRAINT "message_text_user_username_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message" ADD CONSTRAINT "message_sender_username_user_username_fk" FOREIGN KEY ("sender_username") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
