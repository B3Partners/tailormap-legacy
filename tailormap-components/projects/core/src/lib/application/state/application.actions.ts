import { createAction, props } from '@ngrx/store';
import {
  AppLayer,
  GeoService,
  Level,
  SelectedContentItem,
} from '../../../../../bridge/typings';

const applicationActionsPrefix = '[Application]';

export const setApplicationContent = createAction(
  `${applicationActionsPrefix} Set Application Content`,
  props<{ id: number, root: SelectedContentItem[], levels: Level[], layers: AppLayer[] }>(),
);

export const addAppLayer = createAction(
  `${applicationActionsPrefix} Add App Layer`,
  props<{ layer: AppLayer, service: GeoService, levelId: string }>(),
);

export const removeAppLayer = createAction(
  `${applicationActionsPrefix} Remove App Layer`,
  props<{ layer: AppLayer }>(),
);

export const setSelectedAppLayer = createAction(
  `${applicationActionsPrefix} Set Selected App Layer`,
  props<{ layerId: string }>(),
);
