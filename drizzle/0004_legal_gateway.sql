ALTER TABLE "message" ADD COLUMN "text" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message" ADD CONSTRAINT "message_text_user_username_fk" FOREIGN KEY ("text") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
