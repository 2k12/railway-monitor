import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { getProjectInfo } from "../../railway/api";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("📡 Obtener estado en tiempo real de proyectos Railway");

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const project = await getProjectInfo();

  if (!project) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("⚠️ FALLO DEL SISTEMA")
      .setColor("#FF0055") // Neon Red
      .setDescription(
        "No se pudo establecer enlace con la Estación Orbital Railway.\n\n**Posibles causas:**\n1. `RAILWAY_API_TOKEN` inválido (o `RAILWAY_TOKEN`)\n2. El token carece de alcance `Project`\n3. Se requiere reinicio del sistema",
      )
      .setFooter({ text: "CÓDIGO DE ERROR: 401_NO_AUTORIZADO" });

    await interaction.editReply({ embeds: [errorEmbed] });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`🔮 ESTADO DEL SISTEMA // ${project.name}`)
    .setColor("#00F0FF")
    .addFields(
      {
        name: "Servicios",
        value: `${project.services.edges.length} Activos`,
        inline: true,
      },
      {
        name: "Último Despliegue",
        value: project.deployments.edges[0]?.node.status || "DESCONOCIDO",
        inline: true,
      },
    )
    .setTimestamp()
    .setFooter({ text: "Conectado a API Railway" });

  await interaction.editReply({ embeds: [embed] });
};
