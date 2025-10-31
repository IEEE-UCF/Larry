import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, ilike, or, gte, lte, desc, asc, sql } from 'drizzle-orm';
import * as schema from './Schema.js';
import type {
	Member, NewMember,
	Event, NewEvent,
	Project, NewProject,
	Committee, NewCommittee,
	CommitteeMember,
	Sponsorship, NewSponsorship,
} from './Schema.js';

export class Database {
	private client: any;
	private pool: Pool;
	private db: any;
	private isConnected: boolean = false;

	constructor(client: any, connectionString: string) {
		this.client = client;
		this.pool = new Pool({
			connectionString,
			max: 20, // Maximum number of clients in the pool
			idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
			connectionTimeoutMillis: 2000, // How long to wait when connecting
		});
		this.db = drizzle(this.pool, { schema });
	}

	async loadDatabase(): Promise<boolean> {
		try {
			// Test the connection
			const client = await this.pool.connect();
			await client.query('SELECT NOW()');
			client.release();

			this.isConnected = true;
			this.client?.logger?.startup('Connected to PostgreSQL database!');
			return true;
		} catch (error) {
			this.isConnected = false;
			this.client?.logger?.fail('Error connecting to database.');
			console.error('Database connection error:', error);
			return false;
		}
	}

	async closeDatabase(): Promise<boolean> {
		try {
			await this.pool.end();
			this.isConnected = false;
			this.client?.logger?.shutdown('Database connection closed.');
			return true;
		} catch (error) {
			this.client?.logger?.fail('Error closing database.');
			console.error('Database close error:', error);
			return false;
		}
	}

	/**
	 * Check if database is connected
	 */
	isReady(): boolean {
		return this.isConnected;
	}

	/**
	 * Execute a transaction
	 */
	transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
		return this.db.transaction(callback);
	}

	// ==================== MEMBER METHODS ====================

	/**
	 * Get member by Discord user ID
	 */
	async getMemberByDiscordId(discordId: string): Promise<Member | null> {
		try {
			const members = await this.db.select()
				.from(schema.Members)
				.where(eq(schema.Members.discordID, discordId))
				.limit(1);
			return members[0] ?? null;
		} catch (error) {
			console.error('Error getting member by Discord ID:', error);
			return null;
		}
	}

	/**
	 * Get member by database ID
	 */
	async getMemberById(id: string): Promise<Member | null> {
		try {
			const members = await this.db.select()
				.from(schema.Members)
				.where(eq(schema.Members.id, id))
				.limit(1);
			return members[0] ?? null;
		} catch (error) {
			console.error('Error getting member by ID:', error);
			return null;
		}
	}

	/**
	 * Get member by email
	 */
	async getMemberByEmail(email: string): Promise<Member | null> {
		try {
			const members = await this.db.select()
				.from(schema.Members)
				.where(eq(schema.Members.email, email.toLowerCase()))
				.limit(1);
			return members[0] ?? null;
		} catch (error) {
			console.error('Error getting member by email:', error);
			return null;
		}
	}

	/**
	 * Create a new member
	 */
	async createMember(data: NewMember): Promise<Member | null> {
		try {
			const members = await this.db.insert(schema.Members).values({
				...data,
				email: data.email?.toLowerCase(), // Normalize email
			}).returning();
			return members[0] ?? null;
		} catch (error) {
			console.error('Error creating member:', error);
			return null;
		}
	}

	/**
	 * Update member by Discord ID
	 */
	async updateMemberByDiscordId(discordId: string, data: Partial<NewMember>): Promise<Member | null> {
		try {
			const members = await this.db.update(schema.Members)
				.set({
					...data,
					email: data.email?.toLowerCase(), // Normalize email if provided
					updatedAt: new Date(),
				})
				.where(eq(schema.Members.discordID, discordId))
				.returning();
			return members[0] ?? null;
		} catch (error) {
			console.error('Error updating member:', error);
			return null;
		}
	}

	/**
	 * Delete member by Discord ID
	 */
	async deleteMemberByDiscordId(discordId: string): Promise<boolean> {
		try {
			await this.db.delete(schema.Members)
				.where(eq(schema.Members.discordID, discordId));
			return true;
		} catch (error) {
			console.error('Error deleting member:', error);
			return false;
		}
	}

	/**
	 * Search members by name, email, or Discord ID
	 */
	async searchMembers(query: string, limit: number = 50): Promise<Member[]> {
		try {
			const searchTerm = `%${query.toLowerCase()}%`;
			return await this.db.select()
				.from(schema.Members)
				.where(or(
					ilike(schema.Members.firstName, searchTerm),
					ilike(schema.Members.lastName, searchTerm),
					ilike(schema.Members.email, searchTerm),
					ilike(schema.Members.discordID, searchTerm),
				))
				.orderBy(asc(schema.Members.firstName), asc(schema.Members.lastName))
				.limit(limit);
		} catch (error) {
			console.error('Error searching members:', error);
			return [];
		}
	}

	/**
	 * Get all officers
	 */
	async getOfficers(): Promise<Member[]> {
		try {
			return await this.db.select()
				.from(schema.Members)
				.where(eq(schema.Members.officerStatus, true))
				.orderBy(asc(schema.Members.officerRole));
		} catch (error) {
			console.error('Error getting officers:', error);
			return [];
		}
	}

	/**
	 * Get all administrators
	 */
	async getAdministrators(): Promise<Member[]> {
		try {
			return await this.db.select()
				.from(schema.Members)
				.where(eq(schema.Members.administrator, true))
				.orderBy(asc(schema.Members.firstName), asc(schema.Members.lastName));
		} catch (error) {
			console.error('Error getting administrators:', error);
			return [];
		}
	}

	/**
	 * Get members by graduation year
	 */
	async getMembersByGraduationYear(year: number): Promise<Member[]> {
		try {
			return await this.db.select()
				.from(schema.Members)
				.where(eq(schema.Members.graduationYear, year))
				.orderBy(asc(schema.Members.firstName), asc(schema.Members.lastName));
		} catch (error) {
			console.error('Error getting members by graduation year:', error);
			return [];
		}
	}

	/**
	 * Get members by major
	 */
	async getMembersByMajor(major: string): Promise<Member[]> {
		try {
			return await this.db.select()
				.from(schema.Members)
				.where(ilike(schema.Members.major, `%${major}%`))
				.orderBy(asc(schema.Members.firstName), asc(schema.Members.lastName));
		} catch (error) {
			console.error('Error getting members by major:', error);
			return [];
		}
	}

	/**
	 * Get members who have paid dues
	 */
	async getMembersWithPaidDues(): Promise<Member[]> {
		try {
			return await this.db.select()
				.from(schema.Members)
				.where(eq(schema.Members.duesPaid, true))
				.orderBy(asc(schema.Members.firstName), asc(schema.Members.lastName));
		} catch (error) {
			console.error('Error getting members with paid dues:', error);
			return [];
		}
	}

	/**
	 * Get all members with pagination
	 */
	async getAllMembers(page: number = 1, limit: number = 50): Promise<Member[]> {
		try {
			const offset = (page - 1) * limit;
			return await this.db.select()
				.from(schema.Members)
				.orderBy(asc(schema.Members.firstName), asc(schema.Members.lastName))
				.limit(limit)
				.offset(offset);
		} catch (error) {
			console.error('Error getting all members:', error);
			return [];
		}
	}

	/**
	 * Get member count
	 */
	async getMemberCount(): Promise<number> {
		try {
			const result = await this.db.select({ count: sql<number>`count(*)` })
				.from(schema.Members);
			return result[0]?.count ?? 0;
		} catch (error) {
			console.error('Error getting member count:', error);
			return 0;
		}
	}

	// ==================== EVENT METHODS ====================

	/**
	 * Get event by ID
	 */
	async getEventById(id: string): Promise<Event | null> {
		try {
			const events = await this.db.select()
				.from(schema.Events)
				.where(eq(schema.Events.id, id))
				.limit(1);
			return events[0] ?? null;
		} catch (error) {
			console.error('Error getting event by ID:', error);
			return null;
		}
	}

	/**
	 * Create a new event
	 */
	async createEvent(data: NewEvent): Promise<Event | null> {
		try {
			const events = await this.db.insert(schema.Events).values(data).returning();
			return events[0] ?? null;
		} catch (error) {
			console.error('Error creating event:', error);
			return null;
		}
	}

	/**
	 * Get upcoming events
	 */
	async getUpcomingEvents(limit: number = 20): Promise<Event[]> {
		try {
			const now = new Date();
			return await this.db.select()
				.from(schema.Events)
				.where(gte(schema.Events.time, now))
				.orderBy(asc(schema.Events.time))
				.limit(limit);
		} catch (error) {
			console.error('Error getting upcoming events:', error);
			return [];
		}
	}

	/**
	 * Get past events
	 */
	async getPastEvents(limit: number = 20): Promise<Event[]> {
		try {
			const now = new Date();
			return await this.db.select()
				.from(schema.Events)
				.where(lte(schema.Events.time, now))
				.orderBy(desc(schema.Events.time))
				.limit(limit);
		} catch (error) {
			console.error('Error getting past events:', error);
			return [];
		}
	}

	/**
	 * Search events by title or location
	 */
	async searchEvents(query: string, limit: number = 20): Promise<Event[]> {
		try {
			const searchTerm = `%${query.toLowerCase()}%`;
			return await this.db.select()
				.from(schema.Events)
				.where(or(
					ilike(schema.Events.title, searchTerm),
					ilike(schema.Events.location, searchTerm),
					ilike(schema.Events.description, searchTerm),
				))
				.orderBy(desc(schema.Events.time))
				.limit(limit);
		} catch (error) {
			console.error('Error searching events:', error);
			return [];
		}
	}

	// ==================== COMMITTEE METHODS ====================

	/**
	 * Get committee by ID
	 */
	async getCommitteeById(id: string): Promise<Committee | null> {
		try {
			const committees = await this.db.select()
				.from(schema.Committees)
				.where(eq(schema.Committees.id, id))
				.limit(1);
			return committees[0] ?? null;
		} catch (error) {
			console.error('Error getting committee by ID:', error);
			return null;
		}
	}

	/**
	 * Create a new committee
	 */
	async createCommittee(data: NewCommittee): Promise<Committee | null> {
		try {
			const committees = await this.db.insert(schema.Committees).values(data).returning();
			return committees[0] ?? null;
		} catch (error) {
			console.error('Error creating committee:', error);
			return null;
		}
	}

	/**
	 * Get all committees
	 */
	async getAllCommittees(): Promise<Committee[]> {
		try {
			return await this.db.select()
				.from(schema.Committees)
				.orderBy(asc(schema.Committees.title));
		} catch (error) {
			console.error('Error getting all committees:', error);
			return [];
		}
	}

	/**
	 * Search committees by title
	 */
	async searchCommittees(query: string): Promise<Committee[]> {
		try {
			const searchTerm = `%${query.toLowerCase()}%`;
			return await this.db.select()
				.from(schema.Committees)
				.where(ilike(schema.Committees.title, searchTerm))
				.orderBy(asc(schema.Committees.title));
		} catch (error) {
			console.error('Error searching committees:', error);
			return [];
		}
	}

	/**
	 * Get committee members
	 */
	async getCommitteeMembers(committeeId: string): Promise<(CommitteeMember & { member: Member })[]> {
		try {
			return await this.db.select()
				.from(schema.CommitteeMembers)
				.leftJoin(schema.Members, eq(schema.CommitteeMembers.memberId, schema.Members.id))
				.where(eq(schema.CommitteeMembers.committeeId, committeeId));
		} catch (error) {
			console.error('Error getting committee members:', error);
			return [];
		}
	}

	// ==================== PROJECT METHODS ====================

	/**
	 * Get project by ID
	 */
	async getProjectById(id: string): Promise<Project | null> {
		try {
			const projects = await this.db.select()
				.from(schema.Projects)
				.where(eq(schema.Projects.id, id))
				.limit(1);
			return projects[0] ?? null;
		} catch (error) {
			console.error('Error getting project by ID:', error);
			return null;
		}
	}

	/**
	 * Create a new project
	 */
	async createProject(data: NewProject): Promise<Project | null> {
		try {
			const projects = await this.db.insert(schema.Projects).values(data).returning();
			return projects[0] ?? null;
		} catch (error) {
			console.error('Error creating project:', error);
			return null;
		}
	}

	/**
	 * Search projects by title or overview
	 */
	async searchProjects(query: string, limit: number = 20): Promise<Project[]> {
		try {
			const searchTerm = `%${query.toLowerCase()}%`;
			return await this.db.select()
				.from(schema.Projects)
				.where(or(
					ilike(schema.Projects.title, searchTerm),
					ilike(schema.Projects.overview, searchTerm),
				))
				.orderBy(asc(schema.Projects.title))
				.limit(limit);
		} catch (error) {
			console.error('Error searching projects:', error);
			return [];
		}
	}

	/**
	 * Get all projects
	 */
	async getAllProjects(): Promise<Project[]> {
		try {
			return await this.db.select()
				.from(schema.Projects)
				.orderBy(asc(schema.Projects.title));
		} catch (error) {
			console.error('Error getting all projects:', error);
			return [];
		}
	}

	// ==================== SPONSORSHIP METHODS ====================

	/**
	 * Get sponsorship by ID
	 */
	async getSponsorshipById(id: string): Promise<Sponsorship | null> {
		try {
			const sponsorships = await this.db.select()
				.from(schema.Sponsorships)
				.where(eq(schema.Sponsorships.id, id))
				.limit(1);
			return sponsorships[0] ?? null;
		} catch (error) {
			console.error('Error getting sponsorship by ID:', error);
			return null;
		}
	}

	/**
	 * Create a new sponsorship
	 */
	async createSponsorship(data: NewSponsorship): Promise<Sponsorship | null> {
		try {
			const sponsorships = await this.db.insert(schema.Sponsorships).values(data).returning();
			return sponsorships[0] ?? null;
		} catch (error) {
			console.error('Error creating sponsorship:', error);
			return null;
		}
	}

	/**
	 * Get sponsorships by tier
	 */
	async getSponsorshipsByTier(tier: 'bronze' | 'silver' | 'gold'): Promise<Sponsorship[]> {
		try {
			return await this.db.select()
				.from(schema.Sponsorships)
				.where(eq(schema.Sponsorships.tier, tier))
				.orderBy(desc(schema.Sponsorships.moneyDonated));
		} catch (error) {
			console.error('Error getting sponsorships by tier:', error);
			return [];
		}
	}

	/**
	 * Get all sponsorships
	 */
	async getAllSponsorships(): Promise<Sponsorship[]> {
		try {
			return await this.db.select()
				.from(schema.Sponsorships)
				.orderBy(desc(schema.Sponsorships.moneyDonated));
		} catch (error) {
			console.error('Error getting all sponsorships:', error);
			return [];
		}
	}

	// ==================== UTILITY METHODS ====================

	/**
	 * Execute raw SQL query (use with caution)
	 */
	async rawQuery(query: string, params?: any[]): Promise<any> {
		try {
			return await this.pool.query(query, params);
		} catch (error) {
			console.error('Error executing raw query:', error);
			throw error;
		}
	}

	/**
	 * Get the drizzle database instance for complex queries
	 */
	getDB() {
		return this.db;
	}

	/**
	 * Get the connection pool for direct access
	 */
	getPool(): Pool {
		return this.pool;
	}

	/**
	 * Health check - verify database connection
	 */
	async healthCheck(): Promise<boolean> {
		try {
			const client = await this.pool.connect();
			await client.query('SELECT 1');
			client.release();
			return true;
		} catch (error) {
			console.error('Database health check failed:', error);
			return false;
		}
	}
}
