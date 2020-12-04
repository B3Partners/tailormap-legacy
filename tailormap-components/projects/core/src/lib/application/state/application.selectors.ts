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
import { ApplicationTreeHelper } from '../helpers/application-tree.helper';

const selectApplicationState = createFeatureSelector<ApplicationState>(applicationStateKey);

export const selectApplicationId = createSelector(selectApplicationState, state => state.applicationId);
const selectRoot = createSelector(selectApplicationState, state => state.root);
const selectLevels = createSelector(selectApplicationState, state => state.levels);
const selectLayers = createSelector(selectApplicationState, state => state.layers);

export const childToTreeModel = (
  childNode: SelectedContentItem,
  levels: Level[],
  layers: AppLayer[],
  filter?: (item: Level | AppLayer) => boolean,
): TreeModel<Level | AppLayer> => {
  if (childNode.type === 'appLayer') {
    const layer = layers.find(i => i.id === childNode.id);
    if (filter && !filter(layer)) {
      return;
    }
    return {
      id: `appLayer-${layer.id}`,
      label: layer.alias || layer.layerName,
      type: 'layer',
      metadata: layer,
    };
  }
  const level = levels.find(i => i.id === childNode.id);
  if (filter && !filter(level)) {
    return;
  }
  return {
    id: `level-${level.id}`,
    label: level.name,
    type: 'group',
    metadata: level,
    expanded: false,
    children: [
      ...(level.children || []).map(l => childToTreeModel({ id: l, type: 'level' }, levels, layers, filter)),
      ...(level.layers || []).map(l => childToTreeModel({ id: l, type: 'appLayer' }, levels, layers, filter)),
    ].filter(item => !!item),
  };
};

export const selectApplicationTree = createSelector(
  selectRoot,
  selectLevels,
  selectLayers,
  (rootLevel: SelectedContentItem[], levels: Level[], layers: AppLayer[]): TreeModel[] => {
    return rootLevel.map(c => childToTreeModel(c, levels, layers)).filter(item => !!item);
  },
);

export const selectApplicationTreeWithoutBackgroundLayers = createSelector(
  selectRoot,
  selectLevels,
  selectLayers,
  (rootLevel: SelectedContentItem[], levels: Level[], layers: AppLayer[]): TreeModel[] => {
    return rootLevel.map(c => childToTreeModel(c, levels, layers, item => {
      if (ApplicationTreeHelper.isLevel(item)) {
        return !item.background;
      }
      return true;
    })).filter(item => !!item);
  },
);

export const selectLevelForLayer = createSelector(
  selectLevels,
  (levels, appLayerId: string) => levels.find(level => (level.layers || []).indexOf(appLayerId) !== -1),
);
