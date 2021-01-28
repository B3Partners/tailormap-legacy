import { Feature } from '../../shared/generated';
import { FormConfiguration, FormConfigurations } from '../form/form-models';


export const formStateKey = 'form';

export interface FormState {
  features : Feature[];
  feature: Feature;
  closeAfterSave: boolean;
  alreadyDirty: boolean;
  formOpen: boolean;
  treeOpen: boolean;
  formConfigs: Map<string, FormConfiguration>;
}

export const initialFormState: FormState = {
  feature: null,
  features: [],
  closeAfterSave: false,
  formOpen: false,
  alreadyDirty: false,
  treeOpen: false,
  formConfigs: null,
}
