import { AttributeTypeEnum } from '../../application/models/attribute-type.enum';

export interface CriteriaConditionModel {
  id: string;
  source?: number;
  relatedTo?: number;
  attribute?: string;
  attributeType?: AttributeTypeEnum;
  condition?: string;
  value?: string;
}
