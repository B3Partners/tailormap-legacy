import { FormConfiguration, FormFieldType } from '../../../feature-form/form/form-models';

const formConfig: FormConfiguration = {
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
};

export const testFormConfigs = [ formConfig ];
