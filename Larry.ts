import Client from './src/structs/Larry';
const Larry = new Client();

await Larry.init();

process.once('SIGHUP', async () => {
	await Larry.destroy();
	process.exit(0);
});

process.on('rejectionHandled', (err) => console.log(err));
process.on('unhandledRejection', (err) => console.log(err));
process.on('uncaughtException', (err) => console.log(err));
