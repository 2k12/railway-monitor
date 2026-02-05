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

  // 1. First, discover who we are (get Project ID from Token)
  const metaQuery = gql`
    query GetTokenMeta {
      projectToken {
        projectId
        environmentId
      }
    }
  `;

  let targetProjectId = config.RAILWAY_PROJECT_ID;

  if (!targetProjectId) {
    try {
      console.log("🔍 [API] Discovering Project ID via Token...");
      const metaData: any = await client.request(metaQuery);
      if (metaData.projectToken) {
        targetProjectId = metaData.projectToken.projectId;
        console.log(`✅ [API] Discovered Project ID: ${targetProjectId}`);
      }
    } catch (metaError) {
      console.warn(
        "⚠️ Could not fetch Project Token metadata (might be a User Token). Ignoring...",
        metaError,
      );
    }
  }

  // 2. Query Project Data
  if (targetProjectId) {
    console.log(`🎯 [API] Fetching details for Project ID: ${targetProjectId}`);
    const projectQuery = gql`
      query GetProject($id: String!) {
        project(id: $id) {
          id
          name
          deployments {
            edges {
              node {
                id
                status
                createdAt
                meta
              }
            }
          }
          services {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `;

    try {
      const data: any = await client.request(projectQuery, {
        id: targetProjectId,
      });
      return data.project;
    } catch (error: any) {
      console.error("🔥 Failed to fetch specific project:", error);
      if (error.response) {
        console.error(
          "📄 Response Body:",
          JSON.stringify(error.response, null, 2),
        );
      }
      return null;
    }
  }

  // 3. Fallback: User Token approach (List all projects)
  console.log(
    "⚠️ [API] No Project ID found. Attempting User Token fallback (listing all projects)...",
  );
  const fallbackQuery = gql`
    query GetAllProjects {
      projects {
        edges {
          node {
            id
            name
            deployments {
              edges {
                node {
                  id
                  status
                  createdAt
                  meta
                }
              }
            }
            services {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data: any = await client.request(fallbackQuery);
    const projects = data.projects.edges.map((e: any) => e.node);
    if (!projects.length) {
      console.warn("⚠️ No projects found for this token.");
    }
    return projects[0];
  } catch (error: any) {
    console.error(
      "🔥 Failed to fetch Railway data (User Token Fallback):",
      error,
    );
    if (error.response) {
      console.error(
        "📄 Response Body:",
        JSON.stringify(error.response, null, 2),
      );
    }
    return null;
  }
};
