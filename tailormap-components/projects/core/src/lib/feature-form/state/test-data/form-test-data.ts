import { FormState, initialFormState } from '../form.state';
import { FormConfiguration, FormFieldType } from '../../form/form-models';

export const formConfigs = new Map<string, FormConfiguration>();
formConfigs.set('test', {
  featureType: 'test',
  fields: [
    {
      key: 'objectGuid',
      type: FormFieldType.TEXTFIELD,
      column: 1,
      label: 'OBJECTGUIDLABEL',
      tab: 1,
    },
  ],
  name: '',
  tabConfig: undefined,
  tabs: 0,
  treeNodeColumn: '',

});
export const mockFormState: FormState = {
  ...initialFormState,
  formConfigs,
}
