import { AttributeListConfig } from '../models/attribute-list.config';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';

export const attributeListStateKey = 'attributelist';

export interface AttributeListState {
  visible: boolean;
  config: AttributeListConfig;
  tabs: AttributeListTabModel[];
  featureTypeData: AttributeListFeatureTypeData[];
  selectedTabLayerId: string;
}

export const initialAttributeListState: AttributeListState = {
  visible: false,
  config: {
    title: 'Attributenlijst',
    tooltip: '',
    pageSize: 10,
    zoomToBuffer: 10,
  },
  tabs: [],
  featureTypeData: [],
  selectedTabLayerId: null,
};
