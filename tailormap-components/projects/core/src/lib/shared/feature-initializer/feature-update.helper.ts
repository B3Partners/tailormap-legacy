import { Feature, Field } from '../generated';

interface AddReplaceFeatureAttributeProps {
  attributes: Field[];
  key: string;
  allowToAddProperties?: boolean;
  value?: string | number | null;
  type?: string;
}

export class FeatureUpdateHelper {

  public static updateFeatureAttributes(
    feature: Feature,
    params: Record<string, any>,
    allowToAddProperties?: boolean,
  ): Feature {
    let attributes = [ ...feature.attributes ];
    Object.keys(params).forEach(key => {
      attributes = FeatureUpdateHelper.addOrReplaceAttributeValue({
        attributes,
        key,
        allowToAddProperties,
        value: params[key],
      });
    });
    return {
      ...feature,
      attributes,
    };
  }

  public static addOrReplaceAttributeValue({ attributes, key, allowToAddProperties, value, type }: AddReplaceFeatureAttributeProps): Field[] {
    const idx = attributes.findIndex(a => a.key === key);
    if (idx === -1 && !allowToAddProperties) {
      return attributes;
    }
    type = (idx !== -1 ? attributes[idx].type : (type || '')).toLowerCase();
    value = FeatureUpdateHelper.convertValue(value, type);
    if (idx === -1) {
      return [ ...attributes, { key, value, type }];
    }
    return [
      ...attributes.slice(0, idx),
      {
        ...attributes[idx],
        value,
      },
      ...attributes.slice(idx + 1),
    ];
  }

  private static convertValue(value: string | number | null, type?: string): string | number | null {
    if (type === 'double' && typeof value === 'string') {
      return +(value);
    }
    if (type === 'integer' && typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  }

}
