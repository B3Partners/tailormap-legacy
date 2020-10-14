import { Feature } from '../../shared/generated';
import {
  FeatureAttribute,
  FormConfiguration,
  IndexedFeatureAttributes,
} from '../form/form-models';

export class FormCreatorHelpers {

  public static convertFeatureToIndexed(feat: Feature, formConfig: FormConfiguration): IndexedFeatureAttributes {
    const m = new Map<string, FeatureAttribute>();
    for (const field of formConfig.fields) {
      m.set(field.key, {
        ...field,
        value: feat[field.key] ? feat[field.key] : '',
      });
    }
    return {attrs: m};
  }

}
