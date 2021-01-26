import {
  AppLayer,
  Level,
  SelectedContentItem,
} from '../../../../../bridge/typings';

export const applicationStateKey = 'application';

export interface ApplicationState {
  applicationId: number;
  root: SelectedContentItem[];
  levels: Level[];
  layers: AppLayer[];
  selectedAppLayer: string;
}

export const initialApplicationState: ApplicationState = {
  applicationId: null,
  root: [],
  levels: [],
  layers: [],
  selectedAppLayer: null,
}
