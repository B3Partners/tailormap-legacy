import { AttributeTypeEnum } from '../../application/models/attribute-type.enum';

export interface AnalysisSourceModel {
  layerId?: number;
  featureType: number;
  label: string;
  disabled?: boolean;
  geometryType: AttributeTypeEnum;
}
