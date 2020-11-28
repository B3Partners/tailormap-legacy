import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import {
  ApplicationState,
  applicationStateKey,
} from './application.state';
import {
  AppLayer,
  Level,
  SelectedContentItem,
} from '../../../../../bridge/typings';
import { TreeModel } from '../../shared/tree/models/tree.model';

const selectApplicationState = createFeatureSelector<ApplicationState>(applicationStateKey);

const selectRoot = createSelector(selectApplicationState, state => state.root);
const selectLevels = createSelector(selectApplicationState, state => state.levels);
const selectLayers = createSelector(selectApplicationState, state => state.layers);

export const childToTreeModel = (
  childNode: SelectedContentItem,
  levels: Level[],
  layers: AppLayer[],
): TreeModel<Level | AppLayer> => {
  if (childNode.type === 'appLayer') {
    const layer = layers.find(i => i.id === childNode.id);
    return {
      id: layer.id,
      label: layer.layerName,
      type: 'layer',
      metadata: layer,
    };
  }
  const level = levels.find(i => i.id === childNode.id);
  return {
    id: level.id,
    label: level.name,
    type: 'group',
    metadata: level,
    expanded: false,
    children: [
      ...(level.children || []).map(l => childToTreeModel({ id: l, type: 'level' }, levels, layers)),
      ...(level.appLayers || []).map(l => childToTreeModel({ id: l, type: 'appLayer' }, levels, layers)),
    ],
  };
};

export const selectApplicationTree = createSelector(
  selectRoot,
  selectLevels,
  selectLayers,
  (rootLevel: SelectedContentItem[], levels: Level[], layers: AppLayer[]): TreeModel[] => {
    return rootLevel.map(c => childToTreeModel(c, levels, layers));
  },
);
