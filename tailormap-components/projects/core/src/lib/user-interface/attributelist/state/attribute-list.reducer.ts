import { Action, createReducer, on } from '@ngrx/store';
import * as AttributeListActions from './attribute-list.actions';
import { AttributeListState, initialAttributeListState } from './attribute-list.state';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';

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
) => {
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

const attributeListReducerImpl = createReducer(
  initialAttributeListState,
  on(AttributeListActions.setAttributeListVisibility, onSetAttributeListVisibility),
  on(AttributeListActions.setAttributeListConfig, onSetAttributeListConfig),
  on(AttributeListActions.changeAttributeListTabs, onChangeAttributeTabs),
  on(AttributeListActions.setSelectedTab, onSetSelectedTab),
  on(AttributeListActions.loadDataForTab, onLoadDataForTab),
  on(AttributeListActions.loadDataForTabSuccess, onLoadDataForTabSuccess),
  on(AttributeListActions.clearAllFilters, onClearAllFilters),
);

export const attributeListReducer = (state: AttributeListState | undefined, action: Action) => {
  return attributeListReducerImpl(state, action);
}
