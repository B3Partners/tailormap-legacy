import { AttributeTypeEnum } from '../../../application/models/attribute-type.enum';

export type AttributelistColumnType = 'passport' | 'data';

export interface AttributeListColumnModel {
  id: string;
  name: string;
  alias?: string;
  visible: boolean;
  columnType: AttributelistColumnType;
  dataType?: string;
  attributeType?: AttributeTypeEnum;
}
