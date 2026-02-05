import { GraphQLClient, gql } from "graphql-request";
import { config } from "../config";

const endpoint = "https://backboard.railway.app/graphql/v2";

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

  try {
    const data: any = await client.request(query);
    // Return the first project
    const projects = data.projects.edges.map((e: any) => e.node);
    return projects[0];
  } catch (error) {
    console.error("Failed to fetch Railway data:", error);
    return null;
  }
};
