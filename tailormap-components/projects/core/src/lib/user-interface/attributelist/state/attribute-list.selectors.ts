import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AttributeListState, attributeListStateKey } from './attribute-list.state';
import { Relation } from '../../../shared/attribute-service/attribute-models';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { selectOrDefault } from '../../../shared/util/map.helper';
import { TreeModel } from '../../../shared/tree/models/tree.model';

const selectAttributeListState = createFeatureSelector<AttributeListState>(attributeListStateKey);

export const selectAttributeListVisible = createSelector(selectAttributeListState, state => state.visible);

export const selectAttributeListTabs = createSelector(selectAttributeListState, state => state.tabs);

export const selectAttributeListFeatureData = createSelector(selectAttributeListState, state => state.featureTypeData);

export const selectAttributeListTabDictionary = createSelector(
  selectAttributeListTabs,
  (tabs): Map<string, AttributeListTabModel> => {
    return new Map<string, AttributeListTabModel>(tabs.map(tab => [tab.layerId, tab]));
  },
);

export const selectAttributeListFeatureDataDictionary = createSelector(
  selectAttributeListFeatureData,
  (data): Map<number, AttributeListFeatureTypeData> => {
    return new Map<number, AttributeListFeatureTypeData>(data.map(tab => [tab.featureType, tab]));
  },
);

export const selectAttributeListHeight = createSelector(selectAttributeListState, state => state.height);

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

export const selectLoadingDataForTab = createSelector(
  selectAttributeListTabDictionary,
  (tabs, layerId: string): boolean => {
    const tab = tabs.get(layerId);
    if (!tab) {
      return false;
    }
    return tab.loadingData;
  },
);

export const selectFeatureTypeDataForTab = createSelector(
  selectAttributeListFeatureDataDictionary,
  selectSelectedFeatureTypeForTab,
  (data: Map<number, AttributeListFeatureTypeData>, selectedFeatureType: number): AttributeListFeatureTypeData => {
    return data.get(selectedFeatureType);
  },
);

export const selectTabAndFeatureTypeDataForTab = createSelector(
  selectAttributeListFeatureDataDictionary,
  selectSelectedFeatureTypeForTab,
  selectTab,
  (
    data: Map<number, AttributeListFeatureTypeData>,
    selectedFeatureType: number,
    tab: AttributeListTabModel,
  ): [ AttributeListTabModel, AttributeListFeatureTypeData ] => {
    return [ tab, data.get(selectedFeatureType) ];
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
  return [ tab.featureType, ...tab.relatedFeatures.map(r => r.foreignFeatureType) ]
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
    return tabs.find(t => t.relatedFeatures.findIndex(r => r.foreignFeatureType === featureType) !== -1);
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

export const selectShowPassportColumnsOnly = createSelector(
  selectAttributeListFeatureDataDictionary,
  (data: Map<number, AttributeListFeatureTypeData>, featureType: number) => {
    return selectOrDefault<AttributeListFeatureTypeData, number, boolean>(data, featureType, 'showPassportColumnsOnly', true);
  },
);

export const selectSelectedColumnsForFeature = createSelector(
  selectAttributeListFeatureDataDictionary,
  selectShowPassportColumnsOnly,
  (data, showPassportOnly: boolean, featureType: number) => {
    return selectOrDefault<AttributeListFeatureTypeData, number, AttributeListColumnModel[]>(data, featureType, 'columns', [])
      .filter(c => showPassportOnly ? c.columnType === 'passport' : true);
  },
);

const filterColumns = (column: AttributeListColumnModel, showPassportOnly: boolean) => {
  if (showPassportOnly) {
    return column.visible && column.columnType === 'passport';
  }
  return column.visible;
};

export const selectActiveColumnsForFeature = createSelector(
  selectAttributeListFeatureDataDictionary,
  selectShowPassportColumnsOnly,
  (data, showPassportOnly: boolean, featureType: number) => {
    return selectOrDefault<AttributeListFeatureTypeData, number, AttributeListColumnModel[]>(data, featureType, 'columns', [])
      .filter(c => filterColumns(c, showPassportOnly));
  },
);

export const selectColumnsForTab = createSelector(
  selectFeatureTypeDataForTab,
  featureData => featureData ? featureData.columns : [],
);

export const selectShowPassportColumnsOnlyForTab = createSelector(
  selectFeatureTypeDataForTab,
  featureData => featureData ? featureData.showPassportColumnsOnly : false,
);

export const selectActiveColumnsForTab = createSelector(
  selectColumnsForTab,
  selectShowPassportColumnsOnlyForTab,
  (columns, showPassportColumnsOnly): AttributeListColumnModel[] => {
    if (!columns) {
      return [];
    }
    return columns.filter(c => filterColumns(c, showPassportColumnsOnly));
  },
);

export const selectRelatedFeaturesForTab = createSelector(
  selectAttributeListTabDictionary,
  (tabs, layerId: string) => {
    return selectOrDefault<AttributeListTabModel, string, Relation[]>(tabs, layerId, 'relatedFeatures', []);
  },
);

export const selectAttributeListRelationsTree = createSelector(
  selectAttributeListTabDictionary,
  selectAttributeListFeatureDataDictionary,
  (
    tabs: Map<string, AttributeListTabModel>,
    featureTypeData: Map<number, AttributeListFeatureTypeData>,
    layerId: string,
  ): TreeModel[] => {
    const tab = tabs.get(layerId);
    if (!tab) {
      return [];
    }
    const featureData = getFeatureDataForTab(tabs, featureTypeData, layerId);
    const featureDataTreeModels = featureData
      .filter(data => data.featureType !== tab.featureType)
      .map<TreeModel>(data => ({
        id: `${data.featureType}`,
        label: `${data.featureTypeName} (${data.totalCount || 0})`,
      }));
    const tabFeatureData = featureTypeData.get(tab.featureType);
    return [{
      id: `${tab.featureType}`,
      label: `${tab.layerAlias || tab.layerName} (${tabFeatureData.totalCount || 0})`,
      children: featureDataTreeModels,
      expanded: true,
    }];
  },
);

export const selectRowsForTab = createSelector(
  selectFeatureTypeDataForTab,
  featureData => featureData ? featureData.rows : [],
);

export const selectFeatureTypeForTab = createSelector(
  selectFeatureTypeDataForTab,
  featureData => featureData ? featureData.featureType : null,
);


export const selectRowCountForTab = createSelector(
  selectRowsForTab,
  rows => rows.length,
);

export const selectCheckedUncheckedCountForTab = createSelector(
  selectRowsForTab,
  rows => {
    const counters = { checked: 0, unchecked: 0 };
    rows.forEach(row => {
      if (row._checked) {
        counters.checked++;
      } else {
        counters.unchecked++;
      }
    });
    return counters;
  },
);

export const selectSortedColumnForTab = createSelector(
  selectFeatureTypeDataForTab,
  featureData => featureData ? featureData.sortedColumn : '',
);

export const selectSortDirectionForTab = createSelector(
  selectFeatureTypeDataForTab,
  featureData => featureData ? featureData.sortDirection : '',
);

export const selectSortForTab = createSelector(
  selectSortedColumnForTab,
  selectSortDirectionForTab,
  (sortedColumn, sortDirection) => ({ column: sortedColumn, direction: sortDirection.toLowerCase() }),
);

export const selectFiltersForTab = createSelector(
  selectFeatureTypeDataForTab,
  featureData => featureData ? featureData.filter : [],
);

export const selectStatisticsForTab = createSelector(
  selectFeatureTypeDataForTab,
  featureData => featureData ? featureData.statistics : [],
);

export const selectShowCheckboxColumnForTab = createSelector(
  selectTabAndFeatureTypeDataForTab,
  ([ tab, featureData ]) => {
    if (!tab || !featureData) {
      return false;
    }
    return tab.featureType === featureData.featureType;
  },
);
