CREATE TYPE "public"."event_host_type_enum" AS ENUM('club', 'committee', 'project', 'member');--> statement-breakpoint
CREATE TYPE "public"."gender_enum" AS ENUM('M', 'F', 'NB', 'O', 'PNTS');--> statement-breakpoint
CREATE TYPE "public"."officer_role_enum" AS ENUM('executive_chair', 'executive_vice_chair', 'executive_secretary', 'executive_treasurer', 'committee_lead');--> statement-breakpoint
CREATE TYPE "public"."permission_enum" AS ENUM('scan_attendance', 'view_statistics', 'manage_context');--> statement-breakpoint
CREATE TYPE "public"."sponsorship_tier_enum" AS ENUM('bronze', 'silver', 'gold');--> statement-breakpoint
CREATE TABLE "committee_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"committee_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"is_chair" boolean DEFAULT false NOT NULL,
	CONSTRAINT "committee_member_unique" UNIQUE("committee_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "committees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(64),
	"about" text NOT NULL,
	"chair_id" uuid NOT NULL,
	"discord_role_id" varchar(64),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "committees_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_attendee_unique" UNIQUE("event_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"host_type" "event_host_type_enum" NOT NULL,
	"host_id" uuid,
	"slug" varchar(64),
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"requires_dues" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"description" text NOT NULL,
	"flyer_url" varchar(500),
	"rsvp_link" varchar(500),
	"photo_urls" text,
	"duration" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "member_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"granted_by_id" uuid,
	"context_type" varchar(32) NOT NULL,
	"context_id" uuid,
	"permission" "permission_enum" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "member_permission_unique" UNIQUE("member_id","context_type","context_id","permission")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"middle_name" varchar(255),
	"last_name" varchar(255) NOT NULL,
	"officer_role" "officer_role_enum",
	"administrator" boolean DEFAULT false NOT NULL,
	"biography" text,
	"dues_paid" boolean DEFAULT false NOT NULL,
	"discord_id" varchar(64) NOT NULL,
	"date_of_birth" date NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(20),
	"major" varchar(255) NOT NULL,
	"gender" "gender_enum" NOT NULL,
	"graduation_year" integer NOT NULL,
	"portrait_url" varchar(500),
	"resume_url" text,
	"linkedin_url" text,
	"github_url" text,
	"website_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_discord_id_unique" UNIQUE("discord_id"),
	CONSTRAINT "members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"is_lead" boolean DEFAULT false NOT NULL,
	CONSTRAINT "project_member_unique" UNIQUE("project_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(64),
	"overview" text NOT NULL,
	"hardware_info" text,
	"software_info" text,
	"skills" text,
	"photo_urls" text,
	"discord_role_id" varchar(64),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sponsorships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"money_donated" integer NOT NULL,
	"description" text,
	"tier" "sponsorship_tier_enum" NOT NULL,
	"company_logo_url" varchar(500),
	"website_url" varchar(500),
	"contact_email" varchar(255) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_committee_id_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committees" ADD CONSTRAINT "committees_chair_id_members_id_fk" FOREIGN KEY ("chair_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_permissions" ADD CONSTRAINT "member_permissions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_permissions" ADD CONSTRAINT "member_permissions_granted_by_id_members_id_fk" FOREIGN KEY ("granted_by_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "committee_members_idx_id" ON "committee_members" USING btree ("id");--> statement-breakpoint
CREATE INDEX "committee_members_idx_committee_id" ON "committee_members" USING btree ("committee_id");--> statement-breakpoint
CREATE INDEX "committee_members_idx_member_id" ON "committee_members" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "committee_members_idx_is_chair" ON "committee_members" USING btree ("is_chair");--> statement-breakpoint
CREATE INDEX "committees_idx_id" ON "committees" USING btree ("id");--> statement-breakpoint
CREATE INDEX "committees_idx_title" ON "committees" USING btree ("title");--> statement-breakpoint
CREATE INDEX "committees_idx_slug" ON "committees" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "committees_idx_chair_id" ON "committees" USING btree ("chair_id");--> statement-breakpoint
CREATE INDEX "committees_idx_created_at" ON "committees" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "committees_idx_updated_at" ON "committees" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "event_attendees_idx_id" ON "event_attendees" USING btree ("id");--> statement-breakpoint
CREATE INDEX "event_attendees_idx_event_id" ON "event_attendees" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_attendees_idx_member_id" ON "event_attendees" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "events_idx_id" ON "events" USING btree ("id");--> statement-breakpoint
CREATE INDEX "events_idx_host" ON "events" USING btree ("host_type","host_id");--> statement-breakpoint
CREATE INDEX "events_idx_start_time" ON "events" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "events_idx_time_desc" ON "events" USING btree (start_time DESC);--> statement-breakpoint
CREATE INDEX "events_idx_title" ON "events" USING btree ("title");--> statement-breakpoint
CREATE INDEX "events_idx_location" ON "events" USING btree ("location");--> statement-breakpoint
CREATE INDEX "events_idx_created_at" ON "events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "events_idx_updated_at" ON "events" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "member_permissions_idx_member" ON "member_permissions" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "member_permissions_idx_context" ON "member_permissions" USING btree ("context_type","context_id");--> statement-breakpoint
CREATE INDEX "members_idx_id" ON "members" USING btree ("id");--> statement-breakpoint
CREATE INDEX "members_idx_discord_id" ON "members" USING btree ("discord_id");--> statement-breakpoint
CREATE INDEX "members_idx_email" ON "members" USING btree ("email");--> statement-breakpoint
CREATE INDEX "members_idx_officer_role" ON "members" USING btree ("officer_role");--> statement-breakpoint
CREATE INDEX "members_idx_administrator" ON "members" USING btree ("administrator");--> statement-breakpoint
CREATE INDEX "members_idx_dues_paid" ON "members" USING btree ("dues_paid");--> statement-breakpoint
CREATE INDEX "members_idx_graduation_year" ON "members" USING btree ("graduation_year");--> statement-breakpoint
CREATE INDEX "members_idx_major" ON "members" USING btree ("major");--> statement-breakpoint
CREATE INDEX "members_idx_gender" ON "members" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "members_idx_created_at" ON "members" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "members_idx_updated_at" ON "members" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "members_idx_full_name" ON "members" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "project_members_idx_id" ON "project_members" USING btree ("id");--> statement-breakpoint
CREATE INDEX "project_members_idx_project_id" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_members_idx_member_id" ON "project_members" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "project_members_idx_is_lead" ON "project_members" USING btree ("is_lead");--> statement-breakpoint
CREATE INDEX "projects_idx_id" ON "projects" USING btree ("id");--> statement-breakpoint
CREATE INDEX "projects_idx_title" ON "projects" USING btree ("title");--> statement-breakpoint
CREATE INDEX "projects_idx_slug" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_idx_created_at" ON "projects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "projects_idx_updated_at" ON "projects" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "sponsorships_idx_id" ON "sponsorships" USING btree ("id");--> statement-breakpoint
CREATE INDEX "sponsorships_idx_company_name" ON "sponsorships" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "sponsorships_idx_tier" ON "sponsorships" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "sponsorships_idx_created_at" ON "sponsorships" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sponsorships_idx_updated_at" ON "sponsorships" USING btree ("updated_at");