import Larry from './src/structs/Larry.ts';

const bot = new Larry();

await bot.init();

process.once('SIGHUP', async () => {
	await bot.destroy();
	process.exit(0);
});

process.once('SIGINT', async () => {
	await bot.destroy();
	process.exit(0);
});

process.once('SIGTERM', async () => {
	await bot.destroy();
	process.exit(0);
});

process.on('rejectionHandled', (err) => console.log(err));
process.on('unhandledRejection', (err) => console.log(err));
process.on('uncaughtException', (err) => console.log(err));
