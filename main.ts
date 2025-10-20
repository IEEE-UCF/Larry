import * as Discord from 'discord.js';

const config = {
	token: process.env.TOKEN || '',
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.GuildMembers,
		Discord.GatewayIntentBits.GuildModeration,
		Discord.GatewayIntentBits.GuildMessageReactions,
		Discord.GatewayIntentBits.GuildVoiceStates,
		Discord.GatewayIntentBits.GuildExpressions,
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.DirectMessages,
		Discord.GatewayIntentBits.DirectMessageReactions,
		Discord.GatewayIntentBits.DirectMessageTyping,
	],

	partials: [
		Discord.Partials.Message,
		Discord.Partials.Channel,
		Discord.Partials.Reaction,
		Discord.Partials.GuildMember,
		Discord.Partials.User,
		Discord.Partials.GuildScheduledEvent,
		Discord.Partials.ThreadMember,
		Discord.Partials.SoundboardSound,
	],

	permissions: [
		Discord.PermissionsBitField.Flags.Administrator,
	],
};

if (!config.token) {
	console.error('No token provided in environment variables.');
	process.exit(1);
}

const client = new Discord.Client({
	intents: config.intents,
	partials: config.partials,
});

client.on(Discord.Events.ClientReady, () => {
	console.log(`Logged in as ${client.user?.tag}!`);
	const channel = client.channels.cache.get('1427097890677067856') as Discord.TextChannel | undefined;
	if (channel) channel.send('https://tenor.com/view/larry-larry-cat-chat-larry-meme-chat-meme-cat-gif-10061556685042597078');
});

client.login(config.token).catch((error) => {
	console.error('Failed to login:', error);
	process.exit(1);
});
