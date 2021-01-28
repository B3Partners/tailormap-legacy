import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AttributeListState, attributeListStateKey } from './attribute-list.state';
import { RelatedFeatureType } from '../../../shared/attribute-service/attribute-models';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { SubType } from '../../../shared/util/generic.types';

const selectAttributeListState = createFeatureSelector<AttributeListState>(attributeListStateKey);

export const selectAttributeListVisible = createSelector(selectAttributeListState, state => state.visible);

export const selectAttributeListTabs = createSelector(selectAttributeListState, state => state.tabs);

export const selectAttributeListTabDictionary = createSelector(
  selectAttributeListTabs,
  tabs => new Map<string, AttributeListTabModel>(tabs.map(tab => [tab.layerId, tab])),
);

export const selectTab = createSelector(
  selectAttributeListTabDictionary,
  (tabs, layerId: string): AttributeListTabModel => tabs.get(layerId),
);

const selectFromTab = <T>(
  tabs: Map<string, AttributeListTabModel>,
  layerId: string,
  prop: keyof SubType<AttributeListTabModel, T>,
  defaultValue: T,
): T => {
  const tab = tabs.get(layerId);
  if (tab) {
    return tab[prop] as unknown as T;
  }
  return defaultValue;
}

export const selectActiveColumnsForTab = createSelector(
  selectAttributeListTabDictionary,
  (tabs, layerId: string) => {
    return selectFromTab<AttributeListColumnModel[]>(tabs, layerId, 'columns', [])
      .filter(c => c.visible);
  },
);

export const selectRelatedFeaturesForTab = createSelector(
  selectAttributeListTabDictionary,
  (tabs, layerId: string) => {
    return selectFromTab<RelatedFeatureType[]>(tabs, layerId, 'relatedFeatures', []);
  },
);
