import { GraphQLClient, gql } from "graphql-request";
import { config } from "../config";

const endpoint = "https://backboard.railway.app/graphql/v2";

const client = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${config.RAILWAY_API_TOKEN}`,
  },
});

export const getProjectInfo = async (projectId?: string) => {
  if (!config.RAILWAY_API_TOKEN) return null;

  const query = gql`
    query GetProject {
      me {
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
    }
  `;

  try {
    const data: any = await client.request(query);
    // Return the first project if no ID specified, or find the specific one
    const projects = data.me.projects.edges.map((e: any) => e.node);
    return projects[0]; // Simplification for MVP
  } catch (error) {
    console.error("Failed to fetch Railway data:", error);
    return null;
  }
};
