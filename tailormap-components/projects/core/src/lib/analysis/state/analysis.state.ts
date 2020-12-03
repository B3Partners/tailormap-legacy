import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { CriteriaTypeEnum } from '../models/criteria-type.enum';
import { CriteriaModel } from '../models/criteria.model';

export const analysisStateKey = 'analysis';

export interface AnalysisState {
  createLayerMode: CreateLayerModeEnum;
  selectDataSource: boolean;
  selectedDataSource?: AnalysisSourceModel;
  createCriteriaMode?: CriteriaTypeEnum;
  criteria?: CriteriaModel;
}

export const initialAnalysisState: AnalysisState = {
  createLayerMode: null,
  selectDataSource: false,
}
