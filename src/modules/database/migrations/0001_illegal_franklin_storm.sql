CREATE TYPE "public"."event_host_type_enum" AS ENUM('club', 'committee', 'project', 'member');--> statement-breakpoint
CREATE TYPE "public"."permission_enum" AS ENUM('scan_attendance', 'view_statistics', 'manage_context');--> statement-breakpoint
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
ALTER TABLE "events" DROP CONSTRAINT "events_committee_id_committees_id_fk";
--> statement-breakpoint
DROP INDEX "events_idx_committee_id";--> statement-breakpoint
DROP INDEX "members_idx_officer_status";--> statement-breakpoint
DROP INDEX "members_idx_active_officer";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "host_type" "event_host_type_enum" NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "host_id" uuid;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "duration" integer;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "portrait_url" varchar(500);--> statement-breakpoint
ALTER TABLE "member_permissions" ADD CONSTRAINT "member_permissions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_permissions" ADD CONSTRAINT "member_permissions_granted_by_id_members_id_fk" FOREIGN KEY ("granted_by_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "member_permissions_idx_member" ON "member_permissions" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "member_permissions_idx_context" ON "member_permissions" USING btree ("context_type","context_id");--> statement-breakpoint
CREATE INDEX "events_idx_host" ON "events" USING btree ("host_type","host_id");--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "committee_id";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "officer_status";