import { CreateLayerModeEnum } from './create-layer-mode.enum';
import { AnalysisSourceModel } from './analysis-source.model';
import { CriteriaModel } from './criteria.model';
import { PassportAttributeModel } from '../../application/models/passport-attribute.model';
import { UserLayerStyleModel } from './user-layer-style.model';

export interface CreateLayerDataModel {
  canCreateLayer: boolean,
  createLayerMode?: CreateLayerModeEnum,
  selectedDataSource?: AnalysisSourceModel,
  criteria?: CriteriaModel,
  thematicAttribute?: PassportAttributeModel,
  layerName?: string,
  styles?: UserLayerStyleModel[],
  createdAppLayer?: string,
}
