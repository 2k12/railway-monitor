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

  const query = gql`
    query GetProject {
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

  // Debug: Log headers to confirm token is being picked up
  const maskedToken = config.RAILWAY_API_TOKEN
    ? `${config.RAILWAY_API_TOKEN.substring(0, 4)}...${config.RAILWAY_API_TOKEN.substring(config.RAILWAY_API_TOKEN.length - 4)}`
    : "NONE";
  console.log(`📡 [API] Connecting to Railway with Token: ${maskedToken}`);

  try {
    const data: any = await client.request(query);
    // Return the first project
    const projects = data.projects.edges.map((e: any) => e.node);
    if (!projects.length) {
      console.warn("⚠️ No projects found for this token.");
    }
    return projects[0];
  } catch (error: any) {
    console.error("🔥 Failed to fetch Railway data:", error);
    if (error.response) {
      console.error(
        "📄 Response Body:",
        JSON.stringify(error.response, null, 2),
      );
    }
    return null;
  }
};
