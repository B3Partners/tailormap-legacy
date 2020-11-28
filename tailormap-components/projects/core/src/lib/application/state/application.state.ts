import {
  AppLayer,
  Level,
  SelectedContentItem,
} from '../../../../../bridge/typings';

export const applicationStateKey = 'application';

export interface ApplicationState {
  root: SelectedContentItem[];
  levels: Level[];
  layers: AppLayer[];
}

export const initialApplicationState: ApplicationState = {
  root: [],
  levels: [],
  layers: [],
}
