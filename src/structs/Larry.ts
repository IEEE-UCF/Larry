import { Client, Collection } from 'discord.js';
import config from '../config';
import logger from '../modules/helpers/Logger';
import { Database } from '../modules/database/Database';
import { Calendar } from '../modules/calendar/main';


class Larry extends Client {
	config: any;
	prefix: string;
	commands: Collection<string, any>;
	logger: any;
	database: Database;
	calendar: any;

	constructor() {
		super({
			allowedMentions: {
				parse: ['users'],
			},
			intents: config.intents,
			partials: config.partials,
		});

		this.config = config;
		this.prefix = config.prefix;
		this.logger = logger;
		this.database = new Database(this, this.config.databaseUrl);
		this.calendar = new Calendar(this.config.calendarURLs);

		this.commands = new Collection();
	}

	async init() {
		console.clear();
		if (this.config.debug) this.logger.success(`Process started - Runtime ${process.version}`);
		await this.login(this.config.token)
			.then(() => {
				if (this.config.debug) this.logger.success('Client logged in: ' + this.user?.tag);
			})
			.catch((error: Error) => {
				this.logger.fail(`Client failed to login: ${error}`);
				process.exit(1);
			});
	}

	async destroy() {
		await this.database.closeDatabase();
		await super.destroy();
		this.logger.info('Client destroyed and database connection closed.');
	}
}

export default Larry;