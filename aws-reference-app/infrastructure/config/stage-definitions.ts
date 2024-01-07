import config from "../../config/config.json";
import {StageDefinition} from "../lib/stages/app-stage";

export class StageDefinitions {

  public static readonly DEV: StageDefinition = {
    env: {
      account: config.stages[0].accountId,
      region: 'eu-west-1'
    },
    stageName: config.stages[0].name,
    isProductionStage: config.stages[0].isProductionStage,
    isActive: config.stages[0].isActive
  }
  public static readonly PROD: StageDefinition = {
    env: {
      account: config.stages[1].accountId,
      region: 'eu-west-1'
    },
    stageName: config.stages[1].name,
    isProductionStage: config.stages[1].isProductionStage,
    isActive: config.stages[1].isActive
  }

  public static readonly STAGES: StageDefinition[] = [
    StageDefinitions.DEV,
    StageDefinitions.PROD
  ]


}