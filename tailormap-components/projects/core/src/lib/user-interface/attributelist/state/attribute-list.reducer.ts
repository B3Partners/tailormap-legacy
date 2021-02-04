import { Action, createReducer, on } from '@ngrx/store';
import * as AttributeListActions from './attribute-list.actions';
import { AttributeListState, initialAttributeListState } from './attribute-list.state';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributeListRowModel } from '../models/attribute-list-row.model';
import { TabUpdateHelper } from '../helpers/tab-update.helper';

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
    .filter(t => payload.closedTabs.indexOf(t.layerId) === -1)
    .concat(payload.newTabs);
  return {
    ...state,
    tabs,
  };
}

const onSetSelectedTab = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.setSelectedTab>,
): AttributeListState => ({
  ...state,
  selectedTabLayerId: payload.layerId,
});

const updateTab = (
  state: AttributeListState,
  layerId: string,
  updateFn: (tab: AttributeListTabModel) => AttributeListTabModel,
): AttributeListState => {
  const idx = state.tabs.findIndex(t => t.layerId === layerId);
  if (idx === -1) {
    return state;
  }
  return {
    ...state,
    tabs: [
      ...state.tabs.slice(0, idx),
      updateFn(state.tabs[idx]),
      ...state.tabs.slice(idx + 1),
    ],
  };
}

const updateTabRow = (
  state: AttributeListState,
  layerId: string,
  rowId: string,
  updateFn: (tab: AttributeListRowModel) => AttributeListRowModel,
): AttributeListState => {
  return updateTab(state, layerId, tab => {
    const rowIdx = tab.rows.findIndex(r => r.rowId === rowId);
    if (rowIdx === -1) {
      return tab;
    }
    return {
      ...tab,
      rows: [
        ...tab.rows.slice(0, rowIdx),
        updateFn(tab.rows[rowIdx]),
        ...tab.rows.slice(rowIdx + 1),
      ],
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
): AttributeListState => updateTab(state, payload.layerId, tab => ({ ...tab, ...payload.tabChanges, loadingData: false }));

const onClearAllFilters = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.clearAllFilters>,
): AttributeListState => updateTab(state, payload.layerId, tab => ({ ...tab, filter: [] }));

const onUpdatePage = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updatePage>,
): AttributeListState => updateTab(state, payload.layerId, tab => TabUpdateHelper.updateTabForAction(payload, tab));

const onUpdateSort = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateSort>,
): AttributeListState => updateTab(state, payload.layerId, tab => TabUpdateHelper.updateTabForAction(payload, tab));

const onToggleCheckedAllRows = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.toggleCheckedAllRows>,
): AttributeListState => updateTab(state, payload.layerId, tab => {
  const someUnchecked = tab.rows.findIndex(row => !row._checked) !== -1;
  return {
    ...tab,
    rows: tab.rows.map(row => ({ ...row, _checked: someUnchecked })),
  };
});

const onUpdateRowChecked = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateRowChecked>,
): AttributeListState => updateTabRow(state, payload.layerId, payload.rowId, row => ({ ...row, _checked: payload.checked }));

const onUpdateRowExpanded = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateRowExpanded>,
): AttributeListState => updateTabRow(state, payload.layerId, payload.rowId, row => ({ ...row, _expanded: payload.expanded }));

const onUpdateRowSelected = (
  state: AttributeListState,
  payload: ReturnType<typeof AttributeListActions.updateRowSelected>,
): AttributeListState => updateTabRow(state, payload.layerId, payload.rowId, row => ({ ...row, _selected: payload.selected }));

const attributeListReducerImpl = createReducer(
  initialAttributeListState,
  on(AttributeListActions.setAttributeListVisibility, onSetAttributeListVisibility),
  on(AttributeListActions.setAttributeListConfig, onSetAttributeListConfig),
  on(AttributeListActions.changeAttributeListTabs, onChangeAttributeTabs),
  on(AttributeListActions.setSelectedTab, onSetSelectedTab),
  on(AttributeListActions.loadDataForTab, onLoadDataForTab),
  on(AttributeListActions.loadDataForTabSuccess, onLoadDataForTabSuccess),
  on(AttributeListActions.clearAllFilters, onClearAllFilters),
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
