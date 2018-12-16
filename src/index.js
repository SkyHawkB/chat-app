require("dotenv-safe").config();

// Dependencies
const Logger = require("discord-blackhole.logger");
const Discord = require("discord.js");
const Express = require("express");
const IO = require("socket.io");
const Http = require("http");

// Logger Init
Logger.logs(Logger.form("logs/{year}{month}{date}.log"));
Logger.replaceConsole();
Logger.setFormat("{year}/{month}/{date} {hour}:{minute}:{second}");

// HTTP Server Startup
function HTTPServerStartup (App)
{
	return new Promise(async (resolve, reject) => {
		const server = new Http.createServer(App);
		function onStartupFailure (error) { reject(error); }
		function onStartupSuccess () { server.removeListener("error", onStartupFailure); resolve(server); }
		server.once("error", onStartupFailure);
		server.listen(process.env.PORT, onStartupSuccess);
	});
}

// Startup
async function startup ()
{
	// Express Server Startup
	const Application = Express();
	
	
	// HTTP Server Startup
	let Server;
	try
	{
		Server = await HTTPServerStartup(Application);
	} catch (error)
	{
		console.error(error.stack);
		process.exit(0);
	}
	
	// IO Setup
	IO(Server);
	
	// Discord Startup
	const Client = new Discord.Client();
}