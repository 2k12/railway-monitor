import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { getProjectInfo } from "../../railway/api";

export const data = new SlashCommandBuilder()
  .setName("logs")
  .setDescription("📜 Ver historial reciente de despliegues");

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const project = await getProjectInfo();

  if (!project) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("🚫 ACCESO DENEGADO")
      .setColor("#FF0055")
      .setDescription(
        "No se pudieron recuperar los registros de vuelo.\nVerifica la configuración de `RAILWAY_API_TOKEN`.",
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
      return `${icon} [${d.id.substring(0, 6)}] ${d.status} - ${new Date(d.createdAt).toLocaleString("es-ES")}`;
    })
    .join("\n");

  const embed = new EmbedBuilder()
    .setTitle(`📜 REGISTROS DE DESPLIEGUE // ${project.name}`)
    .setColor("#FF00FF") // Neon Magenta
    .setDescription(`\`\`\`log\n${logContent}\n\`\`\``)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
};
