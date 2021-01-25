import { Feature } from '../../shared/generated';


export const formStateKey = 'form';

export interface FormState {
  features : Feature[];
  closeAfterSave: boolean;
  formOpen: boolean;
}

export const initialFormState: FormState = {
  features: [],
  closeAfterSave: false,
  formOpen: false,
}
