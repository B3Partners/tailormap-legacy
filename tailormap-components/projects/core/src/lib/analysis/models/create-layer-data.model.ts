import { CreateLayerModeEnum } from './create-layer-mode.enum';
import { AnalysisSourceModel } from './analysis-source.model';
import { CriteriaModel } from './criteria.model';
import { ExtendedAttributeModel } from '../../application/models/extended-attribute.model';
import { UserLayerStyleModel } from './user-layer-style.model';

export interface CreateLayerDataModel {
  canCreateLayer: boolean;
  createLayerMode?: CreateLayerModeEnum;
  selectedDataSource?: AnalysisSourceModel;
  criteria?: CriteriaModel;
  thematicAttribute?: ExtendedAttributeModel;
  layerName?: string;
  styles?: UserLayerStyleModel[];
  createdAppLayer?: string;
}
