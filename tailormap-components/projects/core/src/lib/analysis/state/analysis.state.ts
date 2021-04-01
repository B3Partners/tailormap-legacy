import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { CriteriaTypeEnum } from '../models/criteria-type.enum';
import { CriteriaModel } from '../models/criteria.model';
import { UserLayerStyleModel } from '../models/user-layer-style.model';
import { ExtendedAttributeModel } from '../../application/models/extended-attribute.model';

export const analysisStateKey = 'analysis';

export interface AnalysisState {
  createLayerMode: CreateLayerModeEnum;
  layerName?: string;
  selectDataSource?: boolean;
  selectedDataSource?: AnalysisSourceModel;
  loadingStyles?: boolean;
  loadStylesErrorMessage?: string;
  styles?: UserLayerStyleModel[];
  selectedStyle?: string;
  isCreatingLayer?: boolean;
  createLayerErrorMessage?: string;
  createdAppLayer?: string;

  // Attributes Mode
  createCriteriaMode?: CriteriaTypeEnum;
  criteria?: CriteriaModel;

  // Thematic Mode
  selectedThematicAttribute?: ExtendedAttributeModel;
}

export const initialAnalysisState: AnalysisState = {
  createLayerMode: null,
};
