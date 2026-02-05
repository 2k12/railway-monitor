import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { getProjectInfo } from "../../railway/api";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("📡 Get real-time status of Railway projects");

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const project = await getProjectInfo();

  if (!project) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("⚠️ SYSTEM MALFUNCTION")
      .setColor("#FF0055") // Neon Red
      .setDescription(
        "Could not establish uplink to Railway Orbital Station.\n\n**Possible Causes:**\n1. Invalid `RAILWAY_API_TOKEN`\n2. Token lacks `Project` scope\n3. System Reboot Required",
      )
      .setFooter({ text: "ERROR CODE: 401_UNAUTHORIZED_OR_BAD_QUERY" });

    await interaction.editReply({ embeds: [errorEmbed] });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`🔮 SYSTEM STATUS // ${project.name}`)
    .setColor("#00F0FF")
    .addFields(
      {
        name: "Services",
        value: `${project.services.edges.length} Active`,
        inline: true,
      },
      {
        name: "Latest Deployment",
        value: project.deployments.edges[0]?.node.status || "UNKNOWN",
        inline: true,
      },
    )
    .setTimestamp()
    .setFooter({ text: "Railway API Connected" });

  await interaction.editReply({ embeds: [embed] });
};
