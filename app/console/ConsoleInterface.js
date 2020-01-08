import { createInterface, Interface } from "readline";
import MinecraftServer from "../MinecraftServer";

export default class ConsoleInterface {

	constructor(server) {
		/**
		 * @type {MinecraftServer}
		 */
		this.server = server;

		/**
		 * @type {Interface}
		 */
		this.ci = createInterface({
			input: process.stdin,
			output: process.stdout
		});

		this.ci.prompt(true);

		this.ci.on("line", ((input) => {
			server.commandHandler.runCommand(server, input)

			this.ci.prompt();
		}).bind(this));

		this.ci.on("close", () => {
			// TODO: Temp. disabled due to interferring and going straight disconnection on vps/linux
			/* 
			process.exit(0); */
		});
	}
}