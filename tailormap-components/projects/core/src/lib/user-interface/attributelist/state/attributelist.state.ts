import { AttributelistConfig } from '../models/attributelist.config';
import { AttributelistTabModel } from '../models/attributelist-tab.model';

export const attributelistStateKey = 'attributelist';

export interface AttributelistState {
  visible: boolean;
  config: AttributelistConfig;
  tables: AttributelistTabModel[];
}

export const initialAttributelistState: AttributelistState = {
  visible: false,
  config: {
    pageSize: 10,
    zoomToBuffer: 10,
  },
  tables: [],
}
