import { Feature } from '../../shared/generated';


export const formStateKey = 'form';

export interface FormState {
  features : Feature[];
  closeAfterSave: boolean;
  alreadyDirty: boolean;
  formOpen: boolean;
  savedFeature: Feature;
}

export const initialFormState: FormState = {
  features: [],
  closeAfterSave: false,
  formOpen: false,
  savedFeature: null,
  alreadyDirty: false,
}
