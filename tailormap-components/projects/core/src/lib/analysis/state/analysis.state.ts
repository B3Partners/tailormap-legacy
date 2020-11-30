import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { AppLayer } from '../../../../../bridge/typings';

export const analysisStateKey = 'analysis';

export interface AnalysisState {
  createLayerMode: CreateLayerModeEnum;
  selectedDataSource?: AppLayer;
}

export const initialAnalysisState: AnalysisState = {
  createLayerMode: null,
}
