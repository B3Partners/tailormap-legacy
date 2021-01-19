
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
  layers: payload.layers.map(l => ({...l, id: `${l.id}`})),
  levels: payload.levels.map(l => ({...l, id: `${l.id}`})),
});

const onAddAppLayer = (state: ApplicationState, payload: { layer: AppLayer, levelId?: string }): ApplicationState => {
  const levelIdx = state.levels.findIndex(l => l.id === payload.levelId);
  if (levelIdx === -1) {
    return {
      ...state,
      layers: [
        ...state.layers,
        payload.layer,
      ],
      root: [
        ...state.root,
        {
          type: 'appLayer',
          id: `${payload.layer.id}`,
        },
      ],
    };
  }
  return {
    ...state,
    layers: [
      ...state.layers,
      { ...payload.layer, id: `${payload.layer.id}` },
    ],
    levels: [
      ...state.levels.slice(0, levelIdx),
      {
        ...state.levels[levelIdx],
        layers: [
          ...state.levels[levelIdx].layers,
          `${payload.layer.id}`,
        ],
      },
      ...state.levels.slice(levelIdx + 1),
    ],
  };
};

const onRemoveLayer = (state: ApplicationState, payload: { layer: AppLayer }): ApplicationState => {
  try {
    const layerIdx = (state.layers || []).findIndex(l => l.id === payload.layer.id);
    const selectedContentIdx = (state.root || []).findIndex(item => item.type === 'appLayer' && item.id === payload.layer.id);
    const levelIdx = (state.levels || []).findIndex(level => (level.layers || []).some(layerId => layerId === payload.layer.id));
    return {
      ...state,
      layers: layerIdx !== -1
        ? [ ...state.layers.slice(0, layerIdx), ...state.layers.slice(layerIdx + 1)]
        : state.layers,
      root: selectedContentIdx !== -1
        ? [ ...state.root.slice(0, selectedContentIdx), ...state.root.slice(selectedContentIdx + 1)]
        : state.root,
      levels: levelIdx !== -1
        ? [
          ...state.levels.slice(0, levelIdx),
          {
            ...state.levels[levelIdx],
            layers: state.levels[levelIdx].layers.filter(layerId => layerId !== payload.layer.id),
          },
          ...state.levels.slice(levelIdx + 1),
        ]
        : state.levels,
      selectedAppLayer: state.selectedAppLayer === payload.layer.id ? '' : state.selectedAppLayer,
    };
  } catch (e) {
    console.log(e);
  }
  return state;
};

const onSetSelectedAppLayer = (state: ApplicationState, payload: { layerId: string }): ApplicationState => ({
  ...state,
  selectedAppLayer: payload.layerId,
});

const applicationReducerImpl = createReducer(
  initialApplicationState,
  on(ApplicationActions.setApplicationContent, onSetApplicationContent),
  on(ApplicationActions.addAppLayer, onAddAppLayer),
  on(ApplicationActions.removeAppLayer, onRemoveLayer),
  on(ApplicationActions.setSelectedAppLayer, onSetSelectedAppLayer),
);

export const applicationReducer = (state: ApplicationState | undefined, action: Action) => {
  return applicationReducerImpl(state, action);
}
