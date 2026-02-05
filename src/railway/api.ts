import { GraphQLClient, gql } from "graphql-request";
import { config } from "../config";

const endpoint = "https://backboard.railway.com/graphql/v2";

const client = new GraphQLClient(endpoint, {
  headers: {
    "Project-Access-Token": config.RAILWAY_API_TOKEN || "",
  },
});

export const getProjectInfo = async (projectId?: string) => {
  if (!config.RAILWAY_API_TOKEN) return null;

  // Debug: Log headers to confirm token is being picked up
  const maskedToken = config.RAILWAY_API_TOKEN
    ? `${config.RAILWAY_API_TOKEN.substring(0, 4)}...${config.RAILWAY_API_TOKEN.substring(config.RAILWAY_API_TOKEN.length - 4)}`
    : "NONE";
  console.log(`📡 [API] Connecting to Railway with Token: ${maskedToken}`);

  // 1. Discover Context (Project & Environment IDs)
  const metaQuery = gql`
    query GetTokenMeta {
      projectToken {
        projectId
        environmentId
      }
    }
  `;

  let targetEnvId = null;

  try {
    console.log("🔍 [API] Authenticating & Discovering Context...");
    const metaData: any = await client.request(metaQuery);
    if (metaData.projectToken) {
      targetEnvId = metaData.projectToken.environmentId;
      console.log(`✅ [API] Authenticated as Environment: ${targetEnvId}`);
    }
  } catch (metaError) {
    console.warn(
      "⚠️ Meta-discovery failed. Token might be invalid or not a Project Token.",
      metaError,
    );
    return null;
  }

  if (!targetEnvId) {
    console.error("❌ Could not determine Environment ID. Aborting.");
    return null;
  }

  // 2. Query Environment Data (Scoped)
  console.log(`🎯 [API] Fetching data for Environment: ${targetEnvId}`);

  // Note: Project Tokens are restricted. We cannot query 'project' or 'services' from Environment.
  // We will fetch what we can (Deployments) and shim the rest.
  const envQuery = gql`
    query GetEnvironment($id: String!) {
      environment(id: $id) {
        id
        name
        deployments(first: 5) {
          edges {
            node {
              id
              status
              createdAt
              meta
            }
          }
        }
      }
    }
  `;

  try {
    const data: any = await client.request(envQuery, { id: targetEnvId });
    const env = data.environment;

    // Transform to match the shape expected by downstream commands (Partial Compatibility)
    return {
      name: `Env: ${env.name}`, // We can only see Environment Name with this token
      deployments: env.deployments,
      services: { edges: [] }, // Cannot list services with Project Token
    };
  } catch (error: any) {
    console.error("🔥 Failed to fetch Environment data:", error);
    if (error.response) {
      console.error(
        "📄 Response Body:",
        JSON.stringify(error.response, null, 2),
      );
    }
    return null;
  }
};
