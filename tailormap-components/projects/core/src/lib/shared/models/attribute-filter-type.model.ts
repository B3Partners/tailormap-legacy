import { AttributeTypeEnum } from './attribute-type.enum';

export interface AttributeFilterTypeModel {
  value: string;
  label: string;
  attributeType?: AttributeTypeEnum;
  readableLabel: string;
}
