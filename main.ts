import Discord from 'discord.js';

const client = new Discord.Client({
	intents: [Discord.GatewayIntentBits.Guilds],
});

client.on('clientReady', () => {
	console.log(`Logged in as ${client.user?.tag}!`);
	const channel: Discord.TextChannel | undefined = client.channels.cache.get('1425207638618144903');
	if (channel) channel.send('https://tenor.com/view/larry-larry-cat-chat-larry-meme-chat-meme-cat-gif-10061556685042597078');
});

client.login(process.env.TOKEN);

