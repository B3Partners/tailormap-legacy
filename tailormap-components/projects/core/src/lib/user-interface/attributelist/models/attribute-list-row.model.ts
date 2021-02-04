import { AttributeListFeature } from '../../../shared/attribute-service/attribute-models';

export interface AttributeListRowModel extends AttributeListFeature {
  rowId: string;
  _checked: boolean;
  _expanded: boolean;
  _selected: boolean;
}
