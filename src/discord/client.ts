import { Client, GatewayIntentBits, Collection } from "discord.js";

export interface ExtendedClient extends Client {
  commands: Collection<string, any>;
}

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
}) as ExtendedClient;

client.commands = new Collection();

client.once("ready", () => {
  console.log(`🚀 Bot is ready! Logged in as ${client.user?.tag}`);
  console.log(`✨ Status: Online and watching for Railway events.`);
});
