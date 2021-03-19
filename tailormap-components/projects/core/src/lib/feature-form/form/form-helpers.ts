import { Feature } from '../../shared/generated';

export class FormHelpers {

  public static capitalize(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  public static snakecaseToCamel(s: string): string {
    return s.replace(/([-_][a-z])/ig, ($1) => {
      return $1.toUpperCase()
        .replace('-', '')
        .replace('_', '');
    });
  }

  public static copyFeature(feature: Feature): Feature {
    const copy = {...feature};

    if (copy.children) {
      copy.children = copy.children.map(value => FormHelpers.copyFeature(value));
    }
    return copy;
  }

  public static copyFeatures(feature: Feature[]): Feature[] {
    return [...feature].map(child => FormHelpers.copyFeature(child));
  }
}
