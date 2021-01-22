import { Action, createReducer, on } from '@ngrx/store';
import * as AttributelistActions from './attributelist.actions';
import { AttributelistState, initialAttributelistState } from './attributelist.state';
import { AttributelistConfig } from '../models/attributelist.config';

const onSetAttributelistVisibility = (state: AttributelistState, payload: { visible: boolean }): AttributelistState => ({
  ...state,
  visible: payload.visible,
});

const onToggleAttributelistVisibility = (state: AttributelistState): AttributelistState => ({
  ...state,
  visible: !state.visible,
});

const onSetAttributelistConfig = (state: AttributelistState, payload: { config: Partial<AttributelistConfig> }): AttributelistState => ({
  ...state,
  config: { ...state.config, ...payload.config },
});

const attributelistReducerImpl = createReducer(
  initialAttributelistState,
  on(AttributelistActions.setAttributelistVisibility, onSetAttributelistVisibility),
  on(AttributelistActions.toggleAttributelistVisibility, onToggleAttributelistVisibility),
  on(AttributelistActions.setAttributelistConfig, onSetAttributelistConfig),
);

export const attributelistReducer = (state: AttributelistState | undefined, action: Action) => {
  return attributelistReducerImpl(state, action);
}
