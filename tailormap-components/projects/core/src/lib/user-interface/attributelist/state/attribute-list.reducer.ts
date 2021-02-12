import { Action, createReducer, on } from '@ngrx/store';
import * as AttributeListActions from './attribute-list.actions';
import { AttributeListState, initialAttributeListState } from './attribute-list.state';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributeListRowModel } from '../models/attribute-list-row.model';
import { UpdateAttributeListStateHelper } from '../helpers/update-attribute-list-state.helper';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { AttributeListFilterModels } from '../models/attribute-list-filter-models';

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
  return {
    ...state,
    tabs: updateArrayItemInState<AttributeListTabModel>(
      state.tabs,
      (t => t.layerId === payload.layerId),
      (tab => ({ ...tab, loadingData: false })),
    ),
    featureTypeData: state.featureTypeData.map<AttributeListFeatureTypeData>(featureTypeData => {
      if (payload.data.featureType !== featureTypeData.featureType) {
        return featureTypeData;
      }
      return {
        ...featureTypeData,
        errorMessage: payload.data.errorMessage,
        totalCount: payload.data.totalCount,
        rows: payload.data.rows,
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

const onLoadTotalCountForTabSuccess = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.loadTotalCountForTabSuccess>,
): AttributeListState => {
  const dict = new Map<number, number>(payload.counts.map(countResult => [countResult.featureType, countResult.totalCount]));
  return {
    ...state,
    featureTypeData: state.featureTypeData.map(data => ({ ...data, totalCount: dict.get(data.featureType) || data.totalCount })),
  }
};

const onUpdatePage = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updatePage>,
): AttributeListState => updateFeatureData(
  state,
  payload.featureType,
  data => UpdateAttributeListStateHelper.updateDataForAction(payload, data),
);

const onUpdateSort = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateSort>,
): AttributeListState => updateFeatureData(
  state,
  payload.featureType,
  data => UpdateAttributeListStateHelper.updateDataForAction(payload, data),
);

const onToggleCheckedAllRows = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.toggleCheckedAllRows>,
): AttributeListState => updateFeatureData(state, payload.featureType, data => {
  const someUnchecked = data.rows.findIndex(row => !row._checked) !== -1;
  const checkedRows = new Set<string>(data.checkedFeatures);
  data.rows.forEach(row => {
    if (someUnchecked) {
      checkedRows.add(row.rowId);
    } else {
      checkedRows.delete(row.rowId);
    }
  });
  return {
    ...data,
    rows: data.rows.map(row => ({ ...row, _checked: someUnchecked })),
    checkedFeatures: Array.from(checkedRows),
  };
});

const onUpdateRowChecked = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateRowChecked>,
): AttributeListState => updateFeatureData(state, payload.featureType, data => {
  const checkedRows = new Set<string>(data.checkedFeatures);
  if (payload.checked) {
    checkedRows.add(payload.rowId);
  } else {
    checkedRows.delete(payload.rowId);
  }
  return {
    ...data,
    rows: updateArrayItemInState<AttributeListRowModel>(
      data.rows,
      r => r.rowId === payload.rowId,
      row => ({ ...row, _checked: payload.checked }),
    ),
    checkedFeatures: Array.from(checkedRows),
  }
});

const onUpdateRowExpanded = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateRowExpanded>,
): AttributeListState => updateTabRow(state, payload.featureType, payload.rowId, row => ({ ...row, _expanded: payload.expanded }));

const onUpdateRowSelected = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateRowSelected>,
): AttributeListState => updateTabRow(state, payload.featureType, payload.rowId, row => ({ ...row, _selected: payload.selected }));

const onSetSelectedFeatureType = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateRowSelected>,
): AttributeListState => updateTab(state, payload.layerId, tab => UpdateAttributeListStateHelper.updateTabForAction(payload, tab));

const onChangeColumnPosition = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.changeColumnPosition>,
): AttributeListState => updateFeatureData(state, payload.featureType, data => {
  const columnIdx = data.columns.findIndex(col => col.id === payload.columnId);
  const siblingIndex = payload.previousColumn === null ? 0 : data.columns.findIndex(col => col.id === payload.previousColumn);
  if (columnIdx === -1 || siblingIndex === -1) {
    return data;
  }
  const updatedColumns = [ ...data.columns ];
  const newPosition = payload.previousColumn === null ? 0 : siblingIndex + 1;
  updatedColumns.splice(newPosition, 0, updatedColumns.splice(columnIdx, 1)[0]);
  return {
    ...data,
    columns: updatedColumns,
  };
});

const onToggleColumnVisible = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.toggleColumnVisible>,
): AttributeListState => updateFeatureData(state, payload.featureType, data => {
  const columnIdx = data.columns.findIndex(col => col.id === payload.columnId);
  if (columnIdx === -1) {
    return data;
  }
  return {
    ...data,
    columns: [
      ...data.columns.slice(0, columnIdx),
      {
        ...data.columns[columnIdx],
        visible: !data.columns[columnIdx].visible,
      },
      ...data.columns.slice(columnIdx + 1),
    ],
  };
})

const onToggleShowPassportColumns = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.toggleShowPassportColumns>,
): AttributeListState => {
  return updateFeatureData(state, payload.featureType, data => ({ ...data, showPassportColumnsOnly: !data.showPassportColumnsOnly }));
}

const onSetSelectedColumnFilter = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.setColumnFilter>,
): AttributeListState => updateFeatureData(state, payload.featureType, tab => {
  const index = tab.filter.findIndex(filter => filter.name === payload.colName);
  let newFilterColumns: AttributeListFilterModels[] = [];
  if (index >= 0) {
    newFilterColumns = updateArrayItemInState<AttributeListFilterModels>(
      tab.filter,
      (f => f.name === payload.colName),
      (filter => ({...filter, name: payload.colName, value: payload.value, type: payload.filterType})),
    );
  } else {
    newFilterColumns = [...tab.filter,
                        {
      name: payload.colName,
      value: payload.value,
      type: payload.filterType,
    }];
  }
  return {
    ...tab,
    filter: newFilterColumns,
  };
});

const onDeleteColumnFilter = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.deleteColumnFilter>,
): AttributeListState => updateFeatureData(state, payload.featureType, tab => {
  const index = tab.filter.findIndex(filter => filter.name === payload.colName);
  let newFilterColumns = [...tab.filter];
  if (index >= 0) {
    newFilterColumns.splice(index,1);
  }
  return {
    ...tab,
    filter: newFilterColumns,
  };
});

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
  on(AttributeListActions.setSelectedFeatureType, onSetSelectedFeatureType),
  on(AttributeListActions.loadTotalCountForTabSuccess, onLoadTotalCountForTabSuccess),
  on(AttributeListActions.changeColumnPosition, onChangeColumnPosition),
  on(AttributeListActions.toggleColumnVisible, onToggleColumnVisible),
  on(AttributeListActions.toggleShowPassportColumns, onToggleShowPassportColumns),
  on(AttributeListActions.setColumnFilter, onSetSelectedColumnFilter),
  on(AttributeListActions.deleteColumnFilter, onDeleteColumnFilter),
);

export const attributeListReducer = (state: AttributeListState | undefined, action: Action) => {
  return attributeListReducerImpl(state, action);
}
