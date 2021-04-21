import { FormConfiguration } from '../../feature-form/form/form-models';

export interface ExtendedFormConfigurationModel extends FormConfiguration {
  tableName: string;
}
