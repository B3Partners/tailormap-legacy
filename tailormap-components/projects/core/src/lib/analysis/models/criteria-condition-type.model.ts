import { AttributeTypeEnum } from '../../application/models/attribute-type.enum';

export interface CriteriaConditionTypeModel {
  value: string;
  label: string;
  attributeType: AttributeTypeEnum;
  readableLabel: string;
}
