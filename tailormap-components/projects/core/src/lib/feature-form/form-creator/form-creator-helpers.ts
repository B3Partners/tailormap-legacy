import { Field, Feature } from '../../shared/generated';
import { FeatureAttribute, FormConfiguration, IndexedFeatureAttributes } from '../form/form-models';
import { AttributeListFeature } from '../../shared/attribute-service/attribute-models';
import { FormHelpers } from '../form/form-helpers';

export class FormCreatorHelpers {

  public static convertFeatureToIndexed(feat: Feature | AttributeListFeature, formConfig: FormConfiguration): IndexedFeatureAttributes {
    const m = new Map<string, FeatureAttribute>();
    for (const field of formConfig.fields) {
      let value = FormHelpers.getValue(feat, field);
      m.set(field.key, {
        ...field,
        value,
        options: field.options ? [ ...field.options.map(opt => ({ ...opt })) ] : undefined,
      });
    }
    return {attrs: m};
  }

  public static getAttribute(feat: Feature, attribute: string): Field{
    return feat.attributes.find(attr => attr.key === attribute );
  }

}
