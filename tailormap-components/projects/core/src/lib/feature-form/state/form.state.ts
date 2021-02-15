import { Feature } from '../../shared/generated';
import { FormConfiguration } from '../form/form-models';


export const formStateKey = 'form';

export enum FormAction {
  IDLE = 'IDLE',
  SAVED = 'SAVED',
}

export interface FormState {
  features : Feature[];
  feature: Feature;
  closeAfterSave: boolean;
  alreadyDirty: boolean;
  formOpen: boolean;
  treeOpen: boolean;
  formConfigsLoaded: boolean;
  formConfigs: Map<string, FormConfiguration>;
  action: FormAction;
}

export const initialFormState: FormState = {
  feature: null,
  features: [],
  closeAfterSave: false,
  formOpen: false,
  alreadyDirty: false,
  treeOpen: false,
  formConfigsLoaded: false,
  formConfigs: null,
  action: FormAction.IDLE,
}
