import express from "express";
import { client } from "./discord/client";
import { config } from "./config";

const app = express();
app.use(express.json());

// Basic health check
app.get("/", (req, res) => {
  res.send("🚄 Railway Discord Bot is running!");
});

// Import and use webhook handler
import webhookRouter from "./railway/webhookHandler";

app.use("/webhooks/railway", webhookRouter);

const start = async () => {
  try {
    // Start Discord Bot
    await client.login(config.DISCORD_TOKEN);

    // Register Commands (using client.user.id)
    const { REST, Routes } = require("discord.js");
    const statusCommand = require("./discord/commands/status");
    const logsCommand = require("./discord/commands/logs");

    // Load commands into client collection
    client.commands.set(statusCommand.data.name, statusCommand);
    client.commands.set(logsCommand.data.name, logsCommand);

    const commands = [statusCommand.data.toJSON(), logsCommand.data.toJSON()];

    const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

    if (client.user) {
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });
      console.log("✅ Commands deployed successfully!");
    }

    // Interaction Handler
    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "❌ Error executing command",
          ephemeral: true,
        });
      }
    });

    // Start Express Server
    app.listen(config.PORT, () => {
      console.log(`📡 Webhook server listening on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("🔥 Error starting application:", error);
    process.exit(1);
  }
};

start();
