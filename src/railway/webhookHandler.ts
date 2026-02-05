import { Router, Request, Response } from "express";
import { EmbedBuilder, ColorResolvable } from "discord.js";
import { client } from "../discord/client";
import { config } from "../config";
import { RailwayWebhookPayload } from "../types/railway";

const router = Router();

// 🔮 Futuristic Aesthetic Configuration
const THEME = {
  colors: {
    SUCCESS: "#00FF9D", // Neon Green
    FAILURE: "#FF0055", // Neon Red
    BUILDING: "#00F0FF", // Cyber Cyan
    QUEUED: "#7000FF", // Electric Purple
    DEFAULT: "#2B2D31", // Dark Graphite
  },
  icons: {
    SUCCESS: "🚀",
    FAILURE: "💥",
    BUILDING: "⚙️",
    QUEUED: "⏳",
    DEFAULT: "📡",
  },
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return {
        color: THEME.colors.SUCCESS,
        icon: THEME.icons.SUCCESS,
        text: "SYSTEM OPERATIONAL",
      };
    case "FAILED":
    case "CRASHED":
      return {
        color: THEME.colors.FAILURE,
        icon: THEME.icons.FAILURE,
        text: "CRITICAL FAILURE",
      };
    case "BUILDING":
    case "DEPLOYING":
      return {
        color: THEME.colors.BUILDING,
        icon: THEME.icons.BUILDING,
        text: "DEPLOYMENT IN PROGRESS",
      };
    case "QUEUED":
      return {
        color: THEME.colors.QUEUED,
        icon: THEME.icons.QUEUED,
        text: "IN QUEUE",
      };
    default:
      return {
        color: THEME.colors.DEFAULT,
        icon: THEME.icons.DEFAULT,
        text: `STATUS: ${status}`,
      };
  }
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const payload = req.body as RailwayWebhookPayload;

    // Validate payload minimally
    if (!payload.project || !payload.deployment) {
      console.warn("⚠️ Received invalid webhook payload");
      res.status(400).send("Invalid payload");
      return;
    }

    const { project, environment, deployment } = payload;
    const statusConfig = getStatusConfig(deployment.status);

    // 🎨 Build the Cyberpunk Embed
    const embed = new EmbedBuilder()
      .setColor(statusConfig.color as ColorResolvable)
      .setTitle(`${statusConfig.icon} RAILWAY // ${statusConfig.text}`)
      .setDescription(
        `
\`\`\`bash
Project: ${project.name}
Env:     ${environment.name}
Status:  ${deployment.status}
\`\`\`
`,
      )
      .addFields(
        {
          name: "🆔 Deployment ID",
          value: `\`${deployment.id.substring(0, 8)}\``,
          inline: true,
        },
        {
          name: "🌿 Branch",
          value: deployment.meta?.branch
            ? `\`${deployment.meta.branch}\``
            : "`N/A`",
          inline: true,
        },
      )
      .setTimestamp()
      .setFooter({
        text: "RAILWAY OBSERVATORY SYSTEM v1.0",
        iconURL: "https://railway.app/brand/logo-light.png",
      });

    // Add Commit Info if available
    if (deployment.meta?.commitMessage) {
      embed.addFields({
        name: "📝 Commit",
        value: `> *${deployment.meta.commitMessage}* \n> — \`${deployment.meta.commitAuthor || "Unknown"}\``,
      });
    }

    // Send to Discord
    const channel = await client.channels.fetch(config.CHANNEL_ID);
    if (channel && "send" in channel) {
      await (channel as any).send({ embeds: [embed] });
      console.log(
        `✅ Notification sent for ${project.name}: ${deployment.status}`,
      );
    } else {
      console.error(
        `❌ Channel ${config.CHANNEL_ID} not found or does not support sending messages.`,
      );
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("🔥 Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
