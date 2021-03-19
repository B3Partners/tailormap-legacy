import { Level, SelectedContentItem } from '../../../../../bridge/typings';
import { TailormapAppLayer } from '../models/tailormap-app-layer.model';
import { FormConfiguration } from '../../feature-form/form/form-models';

export const applicationStateKey = 'application';

export interface ApplicationState {
  applicationId: number;
  root: SelectedContentItem[];
  levels: Level[];
  layers: TailormapAppLayer[];
  selectedAppLayer: string;
  formConfigsLoaded: boolean;
  formConfigs: FormConfiguration[];
}

export const initialApplicationState: ApplicationState = {
  applicationId: null,
  root: [],
  levels: [],
  layers: [],
  selectedAppLayer: null,
  formConfigsLoaded: false,
  formConfigs: [],
};
