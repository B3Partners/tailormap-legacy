import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';

export const analysisStateKey = 'analysis';

export interface AnalysisState {
  createLayerMode: CreateLayerModeEnum;
}

export const initialAnalysisState: AnalysisState = {
  createLayerMode: null,
}
