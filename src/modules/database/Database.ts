import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, ilike, or } from 'drizzle-orm';
import * as schema from './Schema';

export class Database {
	private client: any;
	private pool: any;
	private db: any;

	constructor(client: any, connectionString: string) {
		this.client = client;
		this.pool = new Pool({ connectionString });
		this.db = drizzle(this.pool, { schema });
	}

	async loadDatabase() {
		try {
			await this.pool.connect();
			this.client?.logger?.startup('Connected to PostgreSQL database!');
			return true;
		} catch (error) {
			this.client?.logger?.fail('Error connecting to database.');
			console.error(error);
			return false;
		}
	}

	async closeDatabase() {
		try {
			await this.pool.end();
			this.client?.logger?.shutdown('Database closed.');
			return true;
		} catch (error) {
			this.client?.logger?.fail('Error closing database.');
			console.error(error);
			return false;
		}
	}

	// --- Member Methods ---
	async getMemberByUserId(userId: string) {
		const member = await this.db.select().from(schema.Members).where(eq(schema.Members.userId, userId));
		return member[0] || null;
	}

	async createMember(data: Partial<typeof schema.Members.$inferInsert>) {
		return await this.db.insert(schema.Members).values(data).returning();
	}

	async deleteMemberByUserId(userId: string) {
		await this.db.delete(schema.Members).where(eq(schema.Members.userId, userId));
	}

	async searchMembers(query: string) {
		return await this.db.select().from(schema.Members)
			.where(or(
				ilike(schema.Members.firstName, `%${query}%`),
				ilike(schema.Members.lastName, `%${query}%`),
			));
	}

	async getAllMembers() {
		return await this.db.select().from(schema.Members);
	}

	// --- Committee Methods ---
	async getCommitteeById(id: string) {
		const committee = await this.db.select().from(schema.Committees).where(eq(schema.Committees.id, id));
		return committee[0] || null;
	}

	async createCommittee(data: Partial<typeof schema.Committees.$inferInsert>) {
		return await this.db.insert(schema.Committees).values(data).returning();
	}

	async deleteCommitteeById(id: string) {
		await this.db.delete(schema.Committees).where(eq(schema.Committees.id, id));
	}

	async searchCommittees(query: string) {
		return await this.db.select().from(schema.Committees)
			.where(ilike(schema.Committees.title, `%${query}%`));
	}

	async getAllCommittees() {
		return await this.db.select().from(schema.Committees);
	}

	// --- Project Methods ---
	async getProjectById(id: string) {
		const project = await this.db.select().from(schema.Projects).where(eq(schema.Projects.id, id));
		return project[0] || null;
	}

	async createProject(data: Partial<typeof schema.Projects.$inferInsert>) {
		return await this.db.insert(schema.Projects).values(data).returning();
	}

	async deleteProjectById(id: string) {
		await this.db.delete(schema.Projects).where(eq(schema.Projects.id, id));
	}

	async searchProjects(query: string) {
		return await this.db.select().from(schema.Projects)
			.where(or(
				ilike(schema.Projects.title, `%${query}%`),
				ilike(schema.Projects.overview, `%${query}%`),
			));
	}

	async getAllProjects() {
		return await this.db.select().from(schema.Projects);
	}

	// --- CommitteeMembers Methods ---
	async addCommitteeMember(data: Partial<typeof schema.CommitteeMembers.$inferInsert>) {
		return await this.db.insert(schema.CommitteeMembers).values(data).returning();
	}

	async getCommitteeMembers(committeeId: string) {
		return await this.db.select().from(schema.CommitteeMembers)
			.where(eq(schema.CommitteeMembers.committeeId, committeeId));
	}

	async deleteCommitteeMember(id: string) {
		await this.db.delete(schema.CommitteeMembers).where(eq(schema.CommitteeMembers.id, id));
	}

	// --- ProjectMembers Methods ---
	async addProjectMember(data: Partial<typeof schema.ProjectMembers.$inferInsert>) {
		return await this.db.insert(schema.ProjectMembers).values(data).returning();
	}

	async getProjectMembers(projectId: string) {
		return await this.db.select().from(schema.ProjectMembers)
			.where(eq(schema.ProjectMembers.projectId, projectId));
	}

	async deleteProjectMember(id: string) {
		await this.db.delete(schema.ProjectMembers).where(eq(schema.ProjectMembers.id, id));
	}

	// --- Sponsorships Methods ---
	async getSponsorshipById(id: string) {
		const sponsorship = await this.db.select().from(schema.Sponsorships).where(eq(schema.Sponsorships.id, id));
		return sponsorship[0] || null;
	}

	async createSponsorship(data: Partial<typeof schema.Sponsorships.$inferInsert>) {
		return await this.db.insert(schema.Sponsorships).values(data).returning();
	}

	async deleteSponsorshipById(id: string) {
		await this.db.delete(schema.Sponsorships).where(eq(schema.Sponsorships.id, id));
	}

	async searchSponsorships(query: string) {
		return await this.db.select().from(schema.Sponsorships)
			.where(ilike(schema.Sponsorships.companyName, `%${query}%`));
	}

	async getAllSponsorships() {
		return await this.db.select().from(schema.Sponsorships);
	}

	// --- Utility ---
	async rawQuery(sql: string) {
		return await this.pool.query(sql);
	}
}
