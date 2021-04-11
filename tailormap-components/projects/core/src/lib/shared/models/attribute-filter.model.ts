import { AttributeTypeEnum } from './attribute-type.enum';

export interface AttributeFilterModel {
  featureType: number;
  relatedToFeatureType?: number;
  attribute: string;
  attributeType: AttributeTypeEnum;
  condition: string;
  value: string[];
}
