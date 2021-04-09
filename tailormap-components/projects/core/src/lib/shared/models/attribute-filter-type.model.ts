import { AttributeTypeEnum } from './attribute-type.enum';

export interface AttributeFilterTypeModel {
  condition: string;
  label: string;
  attributeType?: AttributeTypeEnum;
  readableLabel: string;
}
