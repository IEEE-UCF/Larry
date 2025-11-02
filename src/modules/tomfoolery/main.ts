export class Tomfoolery {
	client: any;
	features: string[];
	constructor(client: any) {
		this.client = client;
		this.features = this.client.config.tomfoolery.features;
	}

	// async messageTrolling(message: any): Promise<void> {
	// 	const features = this.features;
	// 	return;
	// }
}