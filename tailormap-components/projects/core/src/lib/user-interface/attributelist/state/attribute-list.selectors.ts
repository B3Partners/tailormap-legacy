import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AttributeListState, attributeListStateKey } from './attribute-list.state';
import { RelatedFeatureType } from '../../../shared/attribute-service/attribute-models';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';

const selectAttributeListState = createFeatureSelector<AttributeListState>(attributeListStateKey);

export const selectAttributeListVisible = createSelector(selectAttributeListState, state => state.visible);

export const selectAttributeListTabs = createSelector(selectAttributeListState, state => state.tabs);

export const selectTab = createSelector(
  selectAttributeListTabs,
  (tabs, layerId: string): AttributeListTabModel => tabs.find(layerId),
);

export const selectActiveColumnsForTab = createSelector(
  selectTab,
  (tab): AttributeListColumnModel[] => (tab?.columns || []).filter(c => c.visible),
);

export const selectRelatedFeaturesForTab = createSelector(
  selectTab,
  (tab): RelatedFeatureType[] => (tab?.relatedFeatures || []),
);

