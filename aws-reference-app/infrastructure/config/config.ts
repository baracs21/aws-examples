import config from '../../config/config.json';

export interface GitHubRepo {
  owner: string,
  repo: string,
  branch: string,
  codestarConnectionArn: string
}

export const GITHUB: GitHubRepo = {
  owner: config["github-repo"]["owner"],
  repo: config["github-repo"]["name"],
  branch: config["github-repo"]["branch"],
  codestarConnectionArn: config["github-repo"]["codestar-connection-arn"]
}

export const APP_NAME = config["app-name"];
export const PIPELINE_ACCOUNT_ID = config.pipeline.accountId;