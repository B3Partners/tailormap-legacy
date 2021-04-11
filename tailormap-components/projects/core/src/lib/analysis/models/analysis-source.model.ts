import { AttributeTypeEnum } from '../../shared/models/attribute-type.enum';

export interface AnalysisSourceModel {
  layerId?: number;
  featureType: number;
  label: string;
  disabled?: boolean;
  geometryAttribute: string;
  geometryType: AttributeTypeEnum;
}
