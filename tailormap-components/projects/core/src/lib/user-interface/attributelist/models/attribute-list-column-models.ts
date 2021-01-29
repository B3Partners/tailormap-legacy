import { AttributeTypeEnum } from '../../../application/models/attribute-type.enum';

export type AttributelistColumnType = 'passport' | 'data' | 'special';

export interface AttributeListColumnModel {
  name: string;
  alias?: string;
  visible: boolean;
  columnType: AttributelistColumnType;
  dataType?: string;
  attributeType?: AttributeTypeEnum;
}
