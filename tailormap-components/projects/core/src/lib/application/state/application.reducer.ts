
import { Action, createReducer, on } from '@ngrx/store';
import * as ApplicationActions from './application.actions';
import {
  ApplicationState,
  initialApplicationState,
} from './application.state';
import {
  AppLayer,
  Level,
  SelectedContentItem,
} from '../../../../../bridge/typings';

const onSetApplicationContent = (
  state: ApplicationState,
  payload: { id: number, root: SelectedContentItem[], levels: Level[], layers: AppLayer[] },
): ApplicationState => ({
  ...state,
  applicationId: payload.id,
  root: payload.root,
  layers: payload.layers,
  levels: payload.levels,
});

const applicationReducerImpl = createReducer(
  initialApplicationState,
  on(ApplicationActions.setApplicationContent, onSetApplicationContent),
);

export const applicationReducer = (state: ApplicationState | undefined, action: Action) => {
  return applicationReducerImpl(state, action);
}
