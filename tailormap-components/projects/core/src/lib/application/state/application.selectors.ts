import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ApplicationState, applicationStateKey } from './application.state';
import { AppLayer, Level, SelectedContentItem } from '../../../../../bridge/typings';
import { TreeModel } from '@tailormap/shared';
import { ApplicationTreeHelper } from '../helpers/application-tree.helper';
import { TailormapAppLayer } from '../models/tailormap-app-layer.model';
import { ExtendedFormConfigurationModel } from '../models/extended-form-configuration.model';

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
  hideEmptyLevels = false,
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
  const levelTreeModel: TreeModel<Level | AppLayer> = {
    id: `level-${level.id}`,
    label: level.name,
    type: 'group',
    metadata: level,
    expanded: false,
    children: [
      ...(level.children || []).map(l => childToTreeModel({ id: l, type: 'level' }, levels, layers, filter, hideEmptyLevels)),
      ...(level.layers || []).map(l => childToTreeModel({ id: l, type: 'appLayer' }, levels, layers, filter, hideEmptyLevels)),
    ].filter(item => !!item),
  };
  if (hideEmptyLevels && levelTreeModel.children.length === 0) {
    return;
  }
  return levelTreeModel;
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
      if (ApplicationTreeHelper.isAppLayer(item)) {
        return !item.userlayer && !item.background;
      }
      return true;
    })).filter(item => !!item);
  },
);

export const selectApplicationTreeWithEditableLayers = createSelector(
  selectRoot,
  selectLevels,
  selectLayers,
  (rootLevel: SelectedContentItem[], levels: Level[], layers: AppLayer[]): TreeModel[] => {
    return rootLevel.map(c => childToTreeModel(c, levels, layers, item => {
      if (ApplicationTreeHelper.isLevel(item)) {
        return !item.background;
      }
      if (ApplicationTreeHelper.isAppLayer(item)) {
        return item.editable && !item.userlayer && !item.background;
      }
      return true;
    }, true)).filter(item => !!item);
  },
);

export const selectLevelForLayer = createSelector(
  selectLevels,
  (levels, appLayerId: string) => levels.find(level => (level.layers || []).indexOf(appLayerId) !== -1),
);

export const selectAppLayerForId = createSelector(
  selectLayers,
  (layers, appLayerId: string) => layers.find(layer => layer.id === appLayerId),
);

export const selectSelectedAppLayerId = createSelector(selectApplicationState, state => state.selectedAppLayer);

export const selectSelectedAppLayer = createSelector(
  selectLayers,
  selectSelectedAppLayerId,
  (appLayers, selectedLayerId) => appLayers.find(a => a.id === selectedLayerId),
);

export const selectVisibleLayers = createSelector(
  selectLayers,
  (appLayers) => appLayers.filter(layer => layer.visible),
);

export const selectLayersWithAttributes = createSelector(
  selectLayers,
  (appLayers) => appLayers.filter(layer => layer.attribute),
);

export const selectVisibleLayersWithAttributes = createSelector(
  selectVisibleLayers,
  (appLayers) => appLayers.filter(layer => layer.attribute),
);

export const selectFormConfigsArray = createSelector(selectApplicationState, state => state.formConfigs);

export const selectFormConfigs = createSelector(selectFormConfigsArray, formConfigs => {
  return new Map<string, ExtendedFormConfigurationModel>(formConfigs.map(f => [ f.tableName, f ]));
});

export const selectFormConfigsLoaded = createSelector(selectApplicationState, state => state.formConfigsLoaded);

export const selectFormConfigForFeatureTypeName = createSelector(
  selectFormConfigs,
  (formConfigs, featureType: string) => formConfigs.get(featureType),
);

export const selectFormConfigFeatureTypeNames = createSelector(
  selectFormConfigsArray,
  (formConfigs): string[] => formConfigs ? formConfigs.map(f => f.featureType) : [],
);

export const selectVisibleLayersWithFormConfig = createSelector(
  selectFormConfigFeatureTypeNames,
  selectVisibleLayers,
  (formConfigFeatureTypeNames, visibleLayers): string[] => {
    if (!visibleLayers || visibleLayers.length === 0) {
      return [];
    }
    const formFeatureTypeNamesSet = new Set<string>(formConfigFeatureTypeNames.map(name => name.toLowerCase()));
    return visibleLayers
      .filter(layer => formFeatureTypeNamesSet.has(layer.layerName))
      .map(layer => layer.layerName);
  },
);

export const selectLayerIdForLayerName = createSelector(
  selectLayers,
  (layers: TailormapAppLayer[], layerName: string): string => {
    const layer = layers.find(l => l.layerName === layerName);
    if (layer) {
      return layer.id;
    }
    return null;
  },
);

export const selectLayerIdForEditingFeatures = createSelector(selectApplicationState, state => state.editFeatureLayerId);

