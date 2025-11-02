CREATE TABLE "event_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_attendee_unique" UNIQUE("event_id","member_id")
);
--> statement-breakpoint
ALTER TABLE "committee_members" DROP CONSTRAINT "committee_members_committee_id_committees_id_fk";
--> statement-breakpoint
ALTER TABLE "committee_members" DROP CONSTRAINT "committee_members_member_id_members_id_fk";
--> statement-breakpoint
ALTER TABLE "committees" DROP CONSTRAINT "committees_chair_id_members_id_fk";
--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_committee_id_committees_id_fk";
--> statement-breakpoint
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_member_id_members_id_fk";
--> statement-breakpoint
DROP INDEX "events_idx_time";--> statement-breakpoint
ALTER TABLE "committees" ADD COLUMN "slug" varchar(64);--> statement-breakpoint
ALTER TABLE "committees" ADD COLUMN "discord_role_id" varchar(64);--> statement-breakpoint
ALTER TABLE "committees" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "slug" varchar(64);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "start_time" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_time" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "requires_dues" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "slug" varchar(64);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "discord_role_id" varchar(64);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "sponsorships" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_attendees_idx_id" ON "event_attendees" USING btree ("id");--> statement-breakpoint
CREATE INDEX "event_attendees_idx_event_id" ON "event_attendees" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_attendees_idx_member_id" ON "event_attendees" USING btree ("member_id");--> statement-breakpoint
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_committee_id_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committees" ADD CONSTRAINT "committees_chair_id_members_id_fk" FOREIGN KEY ("chair_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_committee_id_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "committees_idx_slug" ON "committees" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_idx_start_time" ON "events" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "events_idx_time_desc" ON "events" USING btree (start_time DESC);--> statement-breakpoint
CREATE INDEX "projects_idx_slug" ON "projects" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "time";--> statement-breakpoint
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_member_unique" UNIQUE("committee_id","member_id");--> statement-breakpoint
ALTER TABLE "committees" ADD CONSTRAINT "committees_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_member_unique" UNIQUE("project_id","member_id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_slug_unique" UNIQUE("slug");