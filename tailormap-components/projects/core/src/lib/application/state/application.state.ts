import { Level, SelectedContentItem } from '../../../../../bridge/typings';
import { TailormapAppLayer } from '../models/tailormap-app-layer.model';

export const applicationStateKey = 'application';

export interface ApplicationState {
  applicationId: number;
  root: SelectedContentItem[];
  levels: Level[];
  layers: TailormapAppLayer[];
  selectedAppLayer: string;
}

export const initialApplicationState: ApplicationState = {
  applicationId: null,
  root: [],
  levels: [],
  layers: [],
  selectedAppLayer: null,
}
