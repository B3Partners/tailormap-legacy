import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { CriteriaSourceModel } from '../models/criteria-source.model';

export const analysisStateKey = 'analysis';

export interface AnalysisState {
  createLayerMode: CreateLayerModeEnum;
  selectedDataSource?: CriteriaSourceModel;
}

export const initialAnalysisState: AnalysisState = {
  createLayerMode: CreateLayerModeEnum.ATTRIBUTES,
}
