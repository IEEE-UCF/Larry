import { pgTable, uuid, varchar, boolean, date, integer, text, timestamp, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm/sql/sql';

// ==== Enums ====

// Officer Roles: Executive Chair, Executive Vice Chair, Executive Secretary, Executive Treasurer, Committee Lead
export const officerRoleEnum = pgEnum('officer_role_enum', [
	'executive_chair',
	'executive_vice_chair',
	'executive_secretary',
	'executive_treasurer',
	'committee_lead',
]);

// Permissions
export const permissionEnum = pgEnum('permission_enum', [
	'scan_attendance',
	'view_statistics',
	'manage_context',
]);


// Gender: Male (M), Female (F), Non-Binary (NB), Other (O), Prefer Not to Say (PNTS)
export const genderEnum = pgEnum('gender_enum', [
	'M', 'F', 'NB', 'O', 'PNTS',
]);

// Sponsorship Tiers: Bronze, Silver, Gold
export const sponsorshipTierEnum = pgEnum('sponsorship_tier_enum', [
	'bronze',
	'silver',
	'gold',
]);


// ==== Schemas ====

// Members
export const Members = pgTable('members', {
	id: uuid('id').primaryKey().defaultRandom(),
	firstName: varchar('first_name', { length: 255 }).notNull(),
	middleName: varchar('middle_name', { length: 255 }),
	lastName: varchar('last_name', { length: 255 }).notNull(),
	officerRole: officerRoleEnum('officer_role'),
	administrator: boolean('administrator').notNull().default(false),
	biography: text('biography'),
	duesPaid: boolean('dues_paid').notNull().default(false),
	discordID: varchar('discord_id', { length: 64 }).notNull().unique(),
	dateOfBirth: date('date_of_birth').notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	phoneNumber: varchar('phone_number', { length: 20 }),
	major: varchar('major', { length: 255 }).notNull(), // Check on this to maybe add like a default list of majors or smth similar
	gender: genderEnum('gender').notNull(),
	graduationYear: integer('graduation_year').notNull(),
	portraitUrl: varchar('portrait_url', { length: 500 }),
	resumeURL: text('resume_url'),
	linkedinURL: text('linkedin_url'),
	githubURL: text('github_url'),
	websiteURL: text('website_url'),
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => sql`now()`),
}, (table) => [
	index('members_idx_id').on(table.id),
	index('members_idx_discord_id').on(table.discordID),
	index('members_idx_email').on(table.email),
	index('members_idx_officer_role').on(table.officerRole),
	index('members_idx_administrator').on(table.administrator),
	index('members_idx_dues_paid').on(table.duesPaid),
	index('members_idx_graduation_year').on(table.graduationYear),
	index('members_idx_major').on(table.major),
	index('members_idx_gender').on(table.gender),
	index('members_idx_created_at').on(table.createdAt),
	index('members_idx_updated_at').on(table.updatedAt),
	index('members_idx_full_name').on(table.firstName, table.lastName),
]);

// Committees
export const Committees = pgTable('committees', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: varchar('title', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 64 }).unique(), // URL-friendly identifier, smth like "software" committee or "solarcar" project
	about: text('about').notNull(),
	chairId: uuid('chair_id').notNull().references(() => Members.id, { onDelete: 'cascade' }),
	discordRoleId: varchar('discord_role_id', { length: 64 }),
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => sql`now()`),
}, (table) => [
	index('committees_idx_id').on(table.id),
	index('committees_idx_title').on(table.title),
	index('committees_idx_slug').on(table.slug),
	index('committees_idx_chair_id').on(table.chairId),
	index('committees_idx_created_at').on(table.createdAt),
	index('committees_idx_updated_at').on(table.updatedAt),
]);
// CommitteeMembers: Join table for many-to-many relation between Committees and Members
export const CommitteeMembers = pgTable('committee_members', {
	id: uuid('id').primaryKey().defaultRandom(),
	committeeId: uuid('committee_id').notNull().references(() => Committees.id, { onDelete: 'cascade' }),
	memberId: uuid('member_id').notNull().references(() => Members.id, { onDelete: 'cascade' }),
	isChair: boolean('is_chair').notNull().default(false),
}, (table) => [
	index('committee_members_idx_id').on(table.id),
	index('committee_members_idx_committee_id').on(table.committeeId),
	index('committee_members_idx_member_id').on(table.memberId),
	index('committee_members_idx_is_chair').on(table.isChair),
	unique('committee_member_unique').on(table.committeeId, table.memberId),
]);

// Events
export const eventHostTypeEnum = pgEnum('event_host_type_enum', [
	'club',
	'committee',
	'project',
	'member',
]);

export const Events = pgTable('events', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: varchar('title', { length: 255 }).notNull(),
	location: varchar('location', { length: 255 }).notNull(),
	hostType: eventHostTypeEnum('host_type').notNull(), // 'club', 'committee', 'project', 'member'
	hostId: uuid('host_id'), // nullable, references Committees.id, Projects.id, or Members.id if not 'club'
	slug: varchar('slug', { length: 64 }).unique(),
	startTime: timestamp('start_time', { withTimezone: true }).notNull(),
	endTime: timestamp('end_time', { withTimezone: true }),
	requiresDues: boolean('requires_dues').notNull().default(false),
	active: boolean('active').notNull().default(true),
	description: text('description').notNull(),
	flyerUrl: varchar('flyer_url', { length: 500 }),
	rsvpLink: varchar('rsvp_link', { length: 500 }),
	photoUrls: text('photo_urls').$type<string[]>(),
	duration: integer('duration'), // optional, duration in minutes
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => sql`now()`),
}, (table) => [
	index('events_idx_id').on(table.id),
	index('events_idx_host').on(table.hostType, table.hostId),
	index('events_idx_start_time').on(table.startTime),
	index('events_idx_time_desc').on(sql`start_time DESC`),
	index('events_idx_title').on(table.title),
	index('events_idx_location').on(table.location),
	index('events_idx_created_at').on(table.createdAt),
	index('events_idx_updated_at').on(table.updatedAt),
]);
// EventAttendees: Join table for many-to-many relation between Events and Members
export const EventAttendees = pgTable('event_attendees', {
	id: uuid('id').primaryKey().defaultRandom(),
	eventId: uuid('event_id').notNull().references(() => Events.id, { onDelete: 'cascade' }),
	memberId: uuid('member_id').notNull().references(() => Members.id, { onDelete: 'cascade' }),
	timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
	index('event_attendees_idx_id').on(table.id),
	index('event_attendees_idx_event_id').on(table.eventId),
	index('event_attendees_idx_member_id').on(table.memberId),
	unique('event_attendee_unique').on(table.eventId, table.memberId),
]);

// Projects
export const Projects = pgTable('projects', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: varchar('title', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 64 }).unique(), // URL-friendly identifier, smth like "software" committee or "solarcar" project
	overview: text('overview').notNull(),
	hardwareInfo: text('hardware_info'),
	softwareInfo: text('software_info'),
	skills: text('skills'), // Comma-separated list of skills (e.g. "Python, C++, Machine Learning")
	photoUrls: text('photo_urls').$type<string[]>(),
	discordRoleId: varchar('discord_role_id', { length: 64 }),
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => sql`now()`),
}, (table) => [
	index('projects_idx_id').on(table.id),
	index('projects_idx_title').on(table.title),
	index('projects_idx_slug').on(table.slug),
	index('projects_idx_created_at').on(table.createdAt),
	index('projects_idx_updated_at').on(table.updatedAt),
]);
// ProjectMembers: Join table for many-to-many relation between Projects and Members
export const ProjectMembers = pgTable('project_members', {
	id: uuid('id').primaryKey().defaultRandom(),
	projectId: uuid('project_id').notNull().references(() => Projects.id, { onDelete: 'cascade' }),
	memberId: uuid('member_id').notNull().references(() => Members.id, { onDelete: 'cascade' }),
	isLead: boolean('is_lead').notNull().default(false),
}, (table) => [
	index('project_members_idx_id').on(table.id),
	index('project_members_idx_project_id').on(table.projectId),
	index('project_members_idx_member_id').on(table.memberId),
	index('project_members_idx_is_lead').on(table.isLead),
	unique('project_member_unique').on(table.projectId, table.memberId),
]);

// Sponsorships
export const Sponsorships = pgTable('sponsorships', {
	id: uuid('id').primaryKey().defaultRandom(),
	companyName: varchar('company_name', { length: 255 }).notNull(),
	moneyDonated: integer('money_donated').notNull(),
	description: text('description'),
	tier: sponsorshipTierEnum('tier').notNull(),
	companyLogoUrl: varchar('company_logo_url', { length: 500 }),
	websiteUrl: varchar('website_url', { length: 500 }),
	contactEmail: varchar('contact_email', { length: 255 }).notNull(),
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => sql`now()`),
}, (table) => [
	index('sponsorships_idx_id').on(table.id),
	index('sponsorships_idx_company_name').on(table.companyName),
	index('sponsorships_idx_tier').on(table.tier),
	index('sponsorships_idx_created_at').on(table.createdAt),
	index('sponsorships_idx_updated_at').on(table.updatedAt),
]);

// MemberPermissions: Delegated or custom permissions for members
export const MemberPermissions = pgTable('member_permissions', {
	id: uuid('id').primaryKey().defaultRandom(),
	memberId: uuid('member_id').notNull().references(() => Members.id, { onDelete: 'cascade' }),
	grantedById: uuid('granted_by_id').references(() => Members.id, { onDelete: 'set null' }), // who granted the permission
	contextType: varchar('context_type', { length: 32 }).notNull(), // e.g., 'committee', 'project', 'global'
	contextId: uuid('context_id'), // links to a specific committee/project if applicable
	permission: permissionEnum('permission').notNull(),
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	expiresAt: timestamp('expires_at', { withTimezone: true }), // optional expiration for temporary access
}, (table) => [
	index('member_permissions_idx_member').on(table.memberId),
	index('member_permissions_idx_context').on(table.contextType, table.contextId),
	unique('member_permission_unique').on(table.memberId, table.contextType, table.contextId, table.permission),
]);

// Infer Types
export type Member = typeof Members.$inferSelect;
export type NewMember = typeof Members.$inferInsert;
export type Event = typeof Events.$inferSelect;
export type NewEvent = typeof Events.$inferInsert;
export type EventAttendee = typeof EventAttendees.$inferSelect;
export type NewEventAttendee = typeof EventAttendees.$inferInsert;
export type Project = typeof Projects.$inferSelect;
export type NewProject = typeof Projects.$inferInsert;
export type ProjectMember = typeof ProjectMembers.$inferSelect;
export type NewProjectMember = typeof ProjectMembers.$inferInsert;
export type Committee = typeof Committees.$inferSelect;
export type NewCommittee = typeof Committees.$inferInsert;
export type CommitteeMember = typeof CommitteeMembers.$inferSelect;
export type NewCommitteeMember = typeof CommitteeMembers.$inferInsert;
export type Sponsorship = typeof Sponsorships.$inferSelect;
export type NewSponsorship = typeof Sponsorships.$inferInsert;
export type MemberPermission = typeof MemberPermissions.$inferSelect;
export type NewMemberPermission = typeof MemberPermissions.$inferInsert;
