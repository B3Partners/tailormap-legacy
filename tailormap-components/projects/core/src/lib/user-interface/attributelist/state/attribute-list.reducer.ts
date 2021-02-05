import { Action, createReducer, on } from '@ngrx/store';
import * as AttributeListActions from './attribute-list.actions';
import { AttributeListState, initialAttributeListState } from './attribute-list.state';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributeListRowModel } from '../models/attribute-list-row.model';
import { UpdateFeatureDataHelper } from '../helpers/update-feature-data.helper';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { LoadDataResult } from '../services/attribute-list-data.service';

const onSetAttributeListVisibility = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.setAttributeListVisibility>,
): AttributeListState => ({
  ...state,
  visible: payload.visible,
});

const onSetAttributeListConfig = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.setAttributeListConfig>,
): AttributeListState => ({
  ...state,
  config: { ...state.config, ...payload.config },
});

const onChangeAttributeTabs = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.changeAttributeListTabs>,
): AttributeListState => {
  const tabs = [...state.tabs]
    .filter(t => payload.closedTabs.indexOf(t.featureType) === -1)
    .concat(payload.newTabs);
  const featureTypeData = [...state.featureTypeData]
    .filter(d => {
      const featureType = d.parentFeatureType || d.featureType;
      return payload.closedTabs.indexOf(featureType) === -1;
    })
    .concat(payload.newFeatureData);
  return {
    ...state,
    tabs,
    featureTypeData,
  };
}

const onSetSelectedTab = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.setSelectedTab>,
): AttributeListState => ({
  ...state,
  selectedTabLayerId: payload.layerId,
});

const updateArrayItemInState = <T>(
  list: Array<T>,
  findIndex: (item: T) => boolean,
  updateFn: (item: T) => T,
) => {
  const rowIdx = list.findIndex(findIndex);
  if (rowIdx === -1) {
    return list;
  }
  return [
    ...list.slice(0, rowIdx),
    updateFn(list[rowIdx]),
    ...list.slice(rowIdx + 1),
  ];
}

const updateTab = (
  state: AttributeListState,
  layerId: string,
  updateFn: (tab: AttributeListTabModel) => AttributeListTabModel,
): AttributeListState => {
  return {
    ...state,
    tabs: updateArrayItemInState<AttributeListTabModel>(state.tabs, t => t.layerId === layerId, updateFn),
  };
}

const updateFeatureData = (
  state: AttributeListState,
  featureType: number,
  updateFn: (tab: AttributeListFeatureTypeData) => AttributeListFeatureTypeData,
): AttributeListState => {
  return {
    ...state,
    featureTypeData: updateArrayItemInState<AttributeListFeatureTypeData>(
      state.featureTypeData,
      (t => t.featureType === featureType),
      updateFn,
    ),
  };
}

const updateTabRow = (
  state: AttributeListState,
  featureType: number,
  rowId: string,
  updateFn: (tab: AttributeListRowModel) => AttributeListRowModel,
): AttributeListState => {
  return updateFeatureData(state, featureType, data => {
    return {
      ...data,
      rows: updateArrayItemInState<AttributeListRowModel>(data.rows, r => r.rowId === rowId, updateFn),
    };
  });
}

const onLoadDataForTab = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.loadDataForTab>,
): AttributeListState => updateTab(state, payload.layerId, tab => ({ ...tab, loadingData: true }));

const onLoadDataForTabSuccess = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.loadDataForTabSuccess>,
): AttributeListState => {
  const resultMap = new Map<number, LoadDataResult>(payload.data.map(result => [ result.featureType, result ]));
  return {
    ...state,
    tabs: updateArrayItemInState<AttributeListTabModel>(
      state.tabs,
      (t => t.layerId === payload.layerId),
      (tab => ({ ...tab, loadingData: false })),
    ),
    featureTypeData: state.featureTypeData.map<AttributeListFeatureTypeData>(featureTypeData => {
      if (!resultMap.has(featureTypeData.featureType)) {
        return featureTypeData;
      }
      const result = resultMap.get(featureTypeData.featureType);
      return {
        ...featureTypeData,
        errorMessage: result.errorMessage,
        totalCount: result.totalCount,
        rows: result.rows,
      };
    }),
  }
}

const onLoadDataForFeatureTypeSuccess = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.loadDataForFeatureTypeSuccess>,
): AttributeListState => updateFeatureData(state, payload.featureType, data => ({
  ...data,
  errorMessage: payload.data.errorMessage,
  totalCount: payload.data.totalCount,
  rows: payload.data.rows,
}));

const onUpdatePage = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updatePage>,
): AttributeListState => updateFeatureData(state, payload.featureType, data => UpdateFeatureDataHelper.updateDataForAction(payload, data));

const onUpdateSort = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateSort>,
): AttributeListState => updateFeatureData(state, payload.featureType, data => UpdateFeatureDataHelper.updateDataForAction(payload, data));

const onToggleCheckedAllRows = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.toggleCheckedAllRows>,
): AttributeListState => updateFeatureData(state, payload.featureType, tab => {
  const someUnchecked = tab.rows.findIndex(row => !row._checked) !== -1;
  return {
    ...tab,
    rows: tab.rows.map(row => ({ ...row, _checked: someUnchecked })),
  };
});

const onUpdateRowChecked = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateRowChecked>,
): AttributeListState => updateTabRow(state, payload.featureType, payload.rowId, row => ({ ...row, _checked: payload.checked }));

const onUpdateRowExpanded = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateRowExpanded>,
): AttributeListState => updateTabRow(state, payload.featureType, payload.rowId, row => ({ ...row, _expanded: payload.expanded }));

const onUpdateRowSelected = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateRowSelected>,
): AttributeListState => updateTabRow(state, payload.featureType, payload.rowId, row => ({ ...row, _selected: payload.selected }));

const attributeListReducerImpl = createReducer(
  initialAttributeListState,
  on(AttributeListActions.setAttributeListVisibility, onSetAttributeListVisibility),
  on(AttributeListActions.setAttributeListConfig, onSetAttributeListConfig),
  on(AttributeListActions.changeAttributeListTabs, onChangeAttributeTabs),
  on(AttributeListActions.setSelectedTab, onSetSelectedTab),
  on(AttributeListActions.loadDataForTab, onLoadDataForTab),
  on(AttributeListActions.loadDataForTabSuccess, onLoadDataForTabSuccess),
  on(AttributeListActions.loadDataForFeatureTypeSuccess, onLoadDataForFeatureTypeSuccess),
  on(AttributeListActions.updatePage, onUpdatePage),
  on(AttributeListActions.updateSort, onUpdateSort),
  on(AttributeListActions.toggleCheckedAllRows, onToggleCheckedAllRows),
  on(AttributeListActions.updateRowChecked, onUpdateRowChecked),
  on(AttributeListActions.updateRowExpanded, onUpdateRowExpanded),
  on(AttributeListActions.updateRowSelected, onUpdateRowSelected),
);

export const attributeListReducer = (state: AttributeListState | undefined, action: Action) => {
  return attributeListReducerImpl(state, action);
}
