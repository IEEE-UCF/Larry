export class Tomfoolery {
	client: any;
	features: string[];
	constructor(client: any) {
		this.client = client;
		this.features = this.client.config.tomfoolery.features;
	}

	async speechBubbles(message: any) {
		const speechBubblesConfig = this.client.config.tomfoolery.speechBubbles;
		const chance = Math.random();
		if (chance > speechBubblesConfig?.chance) return;
		if (!speechBubblesConfig?.enabled) return;

		const messageUserId = message.author.id;
		const bubbles = speechBubblesConfig.members[messageUserId] ? speechBubblesConfig.members[messageUserId] : speechBubblesConfig.defaults;
		const image = bubbles[Math.floor(Math.random() * bubbles.length)];
		const messageReply = await message.reply({
			content: image,
		});
		setTimeout(() => {
			messageReply.delete().catch(() => {});
		}, 500 * 1);
	}
}