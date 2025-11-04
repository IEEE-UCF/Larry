import { Database } from './Database';
import { v4 as uuidv4 } from 'uuid';

const connectionString = 'postgres://user:password@localhost:5432/larrydb';

async function main() {
	// Setup: create tables and indexes using Drizzle ORM schema
	// Drizzle will create tables automatically from the schema if they don't exist
	const db = new Database(null, connectionString);

	// Add a member
	const memberRes = await db.createMember({
		id: uuidv4(),
		firstName: 'Larry',
		lastName: 'Bot',
		officerStatus: false,
		administrator: false,
		biography: 'Test member',
		duesPaid: true,
		discordID: '123456789',
		dateOfBirth: '2000-01-01',
		email: 'larry@example.com',
		major: 'Computer Science',
		gender: 'M',
		graduationYear: 2025,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
	const member = memberRes[0];
	console.log('Added member:', member);

	// Add a committee
	const committeeRes = await db.createCommittee({
		id: uuidv4(),
		title: 'Test Committee',
		about: 'A test committee',
		chairId: member.id,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
	const committee = committeeRes[0];
	console.log('Added committee:', committee);

	// Add member to committee
	const committeeMemberRes = await db.addCommitteeMember({
		id: uuidv4(),
		committeeId: committee.id,
		memberId: member.id,
		isChair: true,
	});
	const committeeMember = committeeMemberRes[0];
	console.log('Added committee member:', committeeMember);

	// Get all members
	const members = await db.getAllMembers();
	console.log('All members:', members);

	// Get all committees
	const committees = await db.getAllCommittees();
	console.log('All committees:', committees);

	await db.closeDatabase();
}

main().catch(console.error);
