import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AttributeListState, attributeListStateKey } from './attribute-list.state';
import { RelatedFeatureType } from '../../../shared/attribute-service/attribute-models';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { selectOrDefault } from '../../../shared/util/map.helper';

const selectAttributeListState = createFeatureSelector<AttributeListState>(attributeListStateKey);

export const selectAttributeListVisible = createSelector(selectAttributeListState, state => state.visible);

export const selectAttributeListTabs = createSelector(selectAttributeListState, state => state.tabs);

export const selectAttributeListFeatureData = createSelector(selectAttributeListState, state => state.featureTypeData);

export const selectAttributeListTabDictionary = createSelector(
  selectAttributeListTabs,
  tabs => new Map<string, AttributeListTabModel>(tabs.map(tab => [tab.layerId, tab])),
);

export const selectAttributeListFeatureDataDictionary = createSelector(
  selectAttributeListFeatureData,
  data => new Map<number, AttributeListFeatureTypeData>(data.map(tab => [tab.featureType, tab])),
);

export const selectAttributeListConfig = createSelector(selectAttributeListState, state => state.config);

export const selectTab = createSelector(
  selectAttributeListTabDictionary,
  (tabs, layerId: string): AttributeListTabModel => tabs.get(layerId),
);

export const selectFeatureTypeData = createSelector(
  selectAttributeListFeatureDataDictionary,
  (data, featureType: number): AttributeListFeatureTypeData => data.get(featureType),
);

export const selectSelectedFeatureTypeForTab = createSelector(
  selectAttributeListTabDictionary,
  (tabs, layerId: string): number => {
    const tab = tabs.get(layerId);
    if (!tab) {
      return null;
    }
    return tab.selectedRelatedFeatureType || tab.featureType;
  },
);

const getFeatureDataForTab = (
  tabs: Map<string, AttributeListTabModel>,
  data: Map<number, AttributeListFeatureTypeData>,
  layerId: string,
): AttributeListFeatureTypeData[] => {
  const tab = tabs.get(layerId);
  if (!tab) {
    return [];
  }
  return [ tab.featureType, ...tab.relatedFeatures.map(r => r.id) ]
    .map(featureType => data.get(featureType))
    .filter(featureData => !!featureData);
};

export const selectFeatureDataForTab = createSelector(
  selectAttributeListTabDictionary,
  selectAttributeListFeatureDataDictionary,
  (tabs, data, layerId): AttributeListFeatureTypeData[] => {
    return getFeatureDataForTab(tabs, data, layerId);
  },
);

export const selectTabForFeatureType = createSelector(
  selectAttributeListTabs,
  (tabs: AttributeListTabModel[], featureType: number): AttributeListTabModel => {
    const tab = tabs.find(t => t.featureType === featureType);
    if (tab) {
      return tab;
    }
    return tabs.find(t => t.relatedFeatures.findIndex(r => r.id === featureType) !== -1);
  },
);

export const selectFeatureDataAndRelatedFeatureDataForFeatureType = createSelector(
  selectAttributeListTabDictionary,
  selectAttributeListFeatureDataDictionary,
  (
    tabs: Map<string, AttributeListTabModel>,
    data: Map<number, AttributeListFeatureTypeData>,
    featureType: number,
  ): AttributeListFeatureTypeData[] => {
    if (!data.has(featureType)) {
      return [];
    }
    return getFeatureDataForTab(tabs, data, data.get(featureType).layerId);
  },
);

export const selectActiveColumnsForFeature = createSelector(
  selectAttributeListFeatureDataDictionary,
  (tabs, featureType: number) => {
    return selectOrDefault<AttributeListFeatureTypeData, number, AttributeListColumnModel[]>(tabs, featureType, 'columns', [])
      .filter(c => c.visible);
  },
);

export const selectRelatedFeaturesForTab = createSelector(
  selectAttributeListTabDictionary,
  (tabs, layerId: string) => {
    return selectOrDefault<AttributeListTabModel, string, RelatedFeatureType[]>(tabs, layerId, 'relatedFeatures', []);
  },
);
