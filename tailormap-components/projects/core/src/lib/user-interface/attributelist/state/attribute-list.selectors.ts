import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AttributeListState, attributeListStateKey } from './attribute-list.state';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { selectOrDefault } from '../../../shared/util/map.helper';
import { TreeModel } from '../../../shared/tree/models/tree.model';

const findFeatureTypeData = (props: { featureType: number; layerId: string }) => {
  return (d: AttributeListFeatureTypeData) => d.featureType === props.featureType && d.layerId === props.layerId;
};

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
  selectAttributeListFeatureData,
  (data, { layerId, featureType }): AttributeListFeatureTypeData => {
    return data.find(findFeatureTypeData({ layerId, featureType }));
  },
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
  selectAttributeListFeatureData,
  selectSelectedFeatureTypeForTab,
  (data: AttributeListFeatureTypeData[], selectedFeatureType: number, layerId: string): AttributeListFeatureTypeData => {
    return data.find(findFeatureTypeData({ layerId, featureType: selectedFeatureType }));
  },
);

export const selectTabAndFeatureTypeDataForTab = createSelector(
  selectAttributeListFeatureData,
  selectSelectedFeatureTypeForTab,
  selectTab,
  (
    data: AttributeListFeatureTypeData[],
    selectedFeatureType: number,
    tab: AttributeListTabModel,
  ): [ AttributeListTabModel, AttributeListFeatureTypeData ] => {
    return [ tab, data.find(findFeatureTypeData({ layerId: tab.layerId, featureType: selectedFeatureType })) ];
  },
);

export const selectFeatureDataForTab = createSelector(
  selectAttributeListTabDictionary,
  selectAttributeListFeatureData,
  (tabs, data, layerId): AttributeListFeatureTypeData[] => {
    return data.filter(d => d.layerId === layerId);
  },
);

export const selectShowPassportColumnsOnly = createSelector(
  selectAttributeListFeatureData,
  (data: AttributeListFeatureTypeData[], { layerId, featureType }) => {
    return selectOrDefault<AttributeListFeatureTypeData, boolean>(
      data,
      findFeatureTypeData({ layerId, featureType }),
      'showPassportColumnsOnly',
      true,
    );
  },
);

export const selectSelectedColumnsForFeature = createSelector(
  selectAttributeListFeatureData,
  selectShowPassportColumnsOnly,
  (data, showPassportOnly: boolean, { layerId, featureType }) => {
    return selectOrDefault<AttributeListFeatureTypeData, AttributeListColumnModel[]>(
      data,
      findFeatureTypeData({ layerId, featureType }),
      'columns',
      [],
    )
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
  selectAttributeListFeatureData,
  selectShowPassportColumnsOnly,
  (data, showPassportOnly: boolean, { layerId, featureType }) => {
    return selectOrDefault<AttributeListFeatureTypeData, AttributeListColumnModel[]>(
      data,
      findFeatureTypeData({ layerId, featureType }),
      'columns',
      [],
    )
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

export const selectHasRelations = createSelector(
  selectAttributeListTabDictionary,
  selectAttributeListFeatureData,
  (tabs, featureData, layerId: string) => {
    const tab = tabs.get(layerId);
    if (!tab) {
      return false;
    }
    return featureData.filter(f => f.layerFeatureType === tab.featureType).length > 1;
  },
);

export const selectAttributeListRelationsTree = createSelector(
  selectAttributeListTabDictionary,
  selectAttributeListFeatureData,
  (
    tabs: Map<string, AttributeListTabModel>,
    featureTypeData: AttributeListFeatureTypeData[],
    layerId: string,
  ): TreeModel[] => {
    const tab = tabs.get(layerId);
    if (!tab) {
      return [];
    }
    const featureData = featureTypeData.filter(d => d.layerId === layerId);
    const featureDataTreeModels = featureData
      .filter(data => data.featureType !== tab.featureType)
      .map<TreeModel>(data => ({
        id: `${data.featureType}`,
        label: `${data.featureTypeName} (${data.totalCount || 0})`,
      }));
    const tabFeatureData = featureTypeData.find(findFeatureTypeData({ layerId: tab.layerId, featureType: tab.featureType }));
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
