import * as Discord from 'discord.js';
import { Calendar } from './src/modules/calendar/main';
import ical from 'node-ical';
import axios from 'axios';

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

const eventsCommand = new Discord.SlashCommandBuilder()
	.setName('events')
	.setDescription('Fetch upcoming calendar events')
	.addChannelOption(option =>
		option.setName('channel')
			.setDescription('Channel to send the events to')
			.setRequired(true),
	);

client.on(Discord.Events.ClientReady, async () => {
	console.log(`Logged in as ${client.user?.tag}!`);
	const channel = client.channels.cache.get('1425214114543829032') as Discord.TextChannel | undefined;
	channel?.send('https://tenor.com/view/larry-larry-cat-chat-larry-meme-chat-meme-cat-gif-10061556685042597078');
	const rest = new Discord.REST().setToken(config.token);
	await rest.put(Discord.Routes.applicationCommands(client.user.id), { body: [
		eventsCommand.toJSON(),
	]});
});

client.login(config.token).catch((error) => {
	console.error('Failed to login:', error);
	process.exit(1);
});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return;

	if (message.content === '!ping') {
		message.channel.send('Pong!');
	}
});

client.on(Discord.Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'events') {
		const channel = interaction.options.getChannel('channel') as Discord.TextChannel;
		if (!channel) {
			await interaction.reply({ content: 'Invalid channel!', ephemeral: true });
			return;
		}

		await interaction.deferReply({ ephemeral: true });

		const calendar = new Calendar(['https://calendar.google.com/calendar/ical/ieee.ucf%40gmail.com/public/basic.ics']);
		const events = (await calendar.fetchCalendarEvents()).filter(e => e.start > new Date());

		const duration = events.length > 0 && events[0].end && events[0].start
			? Math.floor(((events[0].end as Date).getTime() - (events[0].start as Date).getTime()) / 1000)
			: null;
		const durationString = function(seconds: number) {
			const days = Math.floor(seconds / 86400);
			const hrs = Math.floor((seconds % 86400) / 3600);
			const mins = Math.floor((seconds % 3600) / 60);
			const secs = seconds % 60;
			let result = '';
			if (days > 0) result += `${days}d `;
			if (hrs > 0) result += `${hrs}h `;
			if (mins > 0) result += `${mins}m `;
			if (secs > 0) result += `${secs}s`;
			return result.trim();
		};

		const embeds = [];
		for (const event of events) {
			const embed = new Discord.EmbedBuilder()
				.setTitle(event.summary || 'No Title')
				.addFields(
					{
						name: 'Location',
						value: event.location ? event.location.toString() : 'N/A',
					},
					{
						name: 'Scheduled for',
						value: Discord.time(event.start as Date, Discord.TimestampStyles.LongDateTime),
						inline: true,
					},
					{
						name: 'Duration',
						value: event.end && event.start
							? durationString(duration as number)
							: 'N/A',
						inline: true,
					},
				)
				.setTimestamp(new Date());
			embeds.push(embed);
		}

		const message = await channel.send({ embeds });
		await interaction.editReply({ content: `Sent ${events.length} events to ${channel}.`, ephemeral: true });
	}
});
