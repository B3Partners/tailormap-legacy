import { Feature } from '../../shared/generated';

export const formStateKey = 'form';

export interface SelectedCopyAttribute {
  fid: string;
  attributeKey: string;
}

export interface FormState {
  features: Feature[];
  feature: Feature;
  closeAfterSave: boolean;
  alreadyDirty: boolean;
  formEnabled: boolean;
  formVisible: boolean;
  treeVisible: boolean;
  editing: boolean;
  multiFormWorkflow: boolean;

  copyFeature: Feature;
  copyDestinationFeatures: Feature[];
  copySelectedAttributes: SelectedCopyAttribute[];
  copySelectedFeature: Feature;
  copyFormOpen: boolean;
  copyOptionsOpen: boolean;
}

export const initialFormState: FormState = {
  feature: null,
  features: [],
  closeAfterSave: false,
  formEnabled: false,
  formVisible: false,
  alreadyDirty: false,
  treeVisible: false,
  editing: false,
  multiFormWorkflow: false,

  copyFeature: null,
  copyDestinationFeatures: [],
  copySelectedAttributes: [],
  copySelectedFeature: null,
  copyFormOpen: false,
  copyOptionsOpen: false,
};
