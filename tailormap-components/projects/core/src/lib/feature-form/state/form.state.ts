import { Feature } from '../../shared/generated';


export const formStateKey = 'form';

export interface FormState {
  features : Feature[];
}

export const initialFormState: FormState = {
  features: [],
}
