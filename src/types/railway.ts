export interface RailwayWebhookPayload {
  type: string;
  project: {
    id: string;
    name: string;
  };
  environment: {
    id: string;
    name: string;
  };
  deployment: {
    id: string;
    status:
      | "QUEUED"
      | "INITIALIZING"
      | "BUILDING"
      | "DEPLOYING"
      | "SUCCESS"
      | "FAILED"
      | "CRASHED"
      | "REMOVED";
    meta?: {
      repoName?: string;
      branch?: string;
      commitAuthor?: string;
      commitMessage?: string;
      commitHash?: string;
    };
    snapshot?: {
      message?: string;
      author?: string;
    };
  };
  timestamp: string;
}
