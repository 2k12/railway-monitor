import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { getProjectInfo } from "../../railway/api";

export const data = new SlashCommandBuilder()
  .setName("logs")
  .setDescription("📜 View recent deployment history");

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const project = await getProjectInfo();

  if (!project) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("🚫 ACCESS DENIED")
      .setColor("#FF0055")
      .setDescription(
        "Unable to retrieve flight recorder logs.\nCheck `RAILWAY_API_TOKEN` configuration.",
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });
    return;
  }

  const deployments = project.deployments.edges.slice(0, 5); // Get last 5

  const logContent = deployments
    .map((edge: any) => {
      const d = edge.node;
      const icon =
        d.status === "SUCCESS" ? "✅" : d.status === "FAILED" ? "❌" : "⏳";
      return `${icon} [${d.id.substring(0, 6)}] ${d.status} - ${new Date(d.createdAt).toLocaleString()}`;
    })
    .join("\n");

  const embed = new EmbedBuilder()
    .setTitle(`📜 DEPLOYMENT LOGS // ${project.name}`)
    .setColor("#FF00FF") // Neon Magenta
    .setDescription(`\`\`\`log\n${logContent}\n\`\`\``)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
};
