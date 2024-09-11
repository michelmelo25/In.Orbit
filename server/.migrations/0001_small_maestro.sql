CREATE TABLE IF NOT EXISTS "goals_completios" (
	"id" text PRIMARY KEY NOT NULL,
	"goal_id" text NOT NULL,
	"created-at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goals_completios" ADD CONSTRAINT "goals_completios_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
