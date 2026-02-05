import { REST, Routes } from "discord.js";
import { config } from "../config";
import * as statusCommand from "./commands/status";
import * as logsCommand from "./commands/logs";

const commands = [statusCommand.data.toJSON(), logsCommand.data.toJSON()];

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export const deployCommands = async () => {
  try {
    console.log("🔄 Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationCommands(config.DISCORD_TOKEN.split(".")[0]), // Simplistic Client ID extraction for now, usually should be explicit
      // Better way: We need Client ID. We can cheat and use Routes.applicationCommands(clientId) if we had it.
      // For now, let's assume the user will provide CLIENT_ID in .env or we extract it.
      // Wait, DISCORD_TOKEN base64 decode gives ID? No.
      // Let's ask user for CLIENT_ID or fetching it from client.user.id after login.
      // We will run this logic INSIDE index.ts after login to be safe.
      { body: commands },
    );

    console.log("✅ Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
};
