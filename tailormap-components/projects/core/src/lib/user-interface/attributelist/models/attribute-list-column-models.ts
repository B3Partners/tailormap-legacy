export type AttributelistColumnType = 'passport' | 'data' | 'special';

export interface AttributeListColumnModel {
  name: string;
  visible: boolean;
  columnType: AttributelistColumnType;
  dataType?: string;
}
