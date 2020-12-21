import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { CriteriaTypeEnum } from '../models/criteria-type.enum';
import { CriteriaModel } from '../models/criteria.model';
import { UserLayerStyleModel } from '../models/user-layer-style.model';

export const analysisStateKey = 'analysis';

export interface AnalysisState {
  createLayerMode: CreateLayerModeEnum;
  layerName?: string;
  selectDataSource?: boolean;
  selectedDataSource?: AnalysisSourceModel;
  createCriteriaMode?: CriteriaTypeEnum;
  criteria?: CriteriaModel;
  style?: UserLayerStyleModel;
  isCreatingLayer?: boolean;
  createLayerErrorMessage?: string;
  createdAppLayer?: string;
}

export const initialAnalysisState: AnalysisState = {
  createLayerMode: null,
}
