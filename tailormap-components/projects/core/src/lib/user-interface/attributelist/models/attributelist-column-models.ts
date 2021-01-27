export type AttributelistColumnType = 'passport' | 'data' | 'special';

export interface AttributelistColumn {
  name: string;
  visible: boolean;
  columnType: AttributelistColumnType;
  dataType?: string;
}
