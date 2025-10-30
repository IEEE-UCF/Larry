import { GatewayIntentBits, Partials, ActivityType } from 'discord.js';

interface Config {
	token: string;
	prefix: string;
	servers: {
		main: {
			id: string;
			channels: {
				announcements: string;
				calendar: string;
				logs: string;
			};
		};
		dev: {
			id: string;
			channels: {
				announcements: string;
				calendar: string;
				logs: string;
			};
		};
	};
	embed: {
		color: string;
		footer: string;
	};
	postgres: string;
	calendarURLs?: string[];
	owners: {
		id: string;
		name: string;
	}[];
	status: {
		name: string;
		type: ActivityType;
	};
	debug: boolean;
	intents: GatewayIntentBits[];
	partials: Partials[];
	custom: Record<string, any>;
}

const config: Config = {
	token: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',

	prefix: 'l!',

	servers: {
		main: {
			id: '',
			channels: {
				announcements: '',
				calendar: '',
				logs: '',
			},
		},
		dev: {
			id: '',
			channels: {
				announcements: '',
				calendar: '',
				logs: '',
			},
		},
	},

	embed: {
		color: '#FFD61A',
		footer: 'Larry | IEEE@UCF Software Committee',
	},

	postgres: '',

	calendarURLs: [],

	owners: [
		{
			id: '',
			name: '',
		},
	],

	status: {
		name: 'you',
		type: ActivityType.Watching,
	},

	debug: false,

	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildExpressions,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
	],

	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
		Partials.GuildMember,
		Partials.User,
		Partials.GuildScheduledEvent,
		Partials.ThreadMember,
		Partials.SoundboardSound,
	],

	custom: {},
};

export default config;