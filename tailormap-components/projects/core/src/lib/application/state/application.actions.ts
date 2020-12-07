import { createAction, props } from '@ngrx/store';
import {
  AppLayer,
  GeoService,
  GeoServiceLayer,
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
)
