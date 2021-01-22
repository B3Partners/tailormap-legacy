import { AttributelistConfig } from '../models/attributelist.config';

export const attributelistStateKey = 'attributelist';

export interface AttributelistState {
  visible: boolean;
  config: AttributelistConfig;
}

export const initialAttributelistState: AttributelistState = {
  visible: false,
  config: {
    pageSize: 10,
    zoomToBuffer: 10,
  },
}
