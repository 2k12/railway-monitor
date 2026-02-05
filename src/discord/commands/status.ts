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
    await interaction.editReply(
      "❌ Could not fetch project data. Check `RAILWAY_API_TOKEN`.",
    );
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
