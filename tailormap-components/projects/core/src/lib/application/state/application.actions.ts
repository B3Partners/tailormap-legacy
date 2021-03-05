import { createAction, props } from '@ngrx/store';
import {
  AppLayer,
  GeoService,
  Level,
  SelectedContentItem,
} from '../../../../../bridge/typings';
import { TailormapAppLayer } from '../models/tailormap-app-layer.model';
import { FormConfiguration } from '../../feature-form/form/form-models';

const applicationActionsPrefix = '[Application]';

export const setApplicationContent = createAction(
  `${applicationActionsPrefix} Set Application Content`,
  props<{ id: number, root: SelectedContentItem[], levels: Level[], layers: AppLayer[] }>(),
);

export const addAppLayer = createAction(
  `${applicationActionsPrefix} Add App Layer`,
  props<{ layer: TailormapAppLayer, service: GeoService, levelId: string }>(),
);

export const removeAppLayer = createAction(
  `${applicationActionsPrefix} Remove App Layer`,
  props<{ layer: TailormapAppLayer }>(),
);

export const setSelectedAppLayer = createAction(
  `${applicationActionsPrefix} Set Selected App Layer`,
  props<{ layerId: string }>(),
);

export const setLayerVisibility = createAction(
  `${applicationActionsPrefix} Set Layer Visibility`,
  props<{ visibility: Map<string, boolean> }>(),
);

export const setFormConfigs = createAction(
  `${applicationActionsPrefix} Set Form Configurations`,
  props<{ formConfigs : Map<string, FormConfiguration> }>(),
);
