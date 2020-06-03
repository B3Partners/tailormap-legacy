import {Feature} from "../../shared/generated";
import {FeatureAttribute, FormConfiguration, IndexedFeatureAttributes} from "../wegvakken-form/wegvakken-form-models";

export class WegvakkenFormCreatorHelpers {

  public static  convertFeatureToIndexed(feat: Feature, formConfig: FormConfiguration): IndexedFeatureAttributes {
    const m = new Map<string, FeatureAttribute>();
    for (const field of formConfig.fields) {
      m.set(field.key, {
        ...field,
        value: feat[field.key] ? feat[field.key] : ''
      });
    }
    return {attrs: m};
  }
}
