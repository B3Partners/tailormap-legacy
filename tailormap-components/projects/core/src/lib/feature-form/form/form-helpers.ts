import { Feature } from '../../shared/generated';
import { AttributeListFeature } from '../../shared/attribute-service/attribute-models';
import { Attribute, FormConfiguration } from './form-models';
import { FormCreatorHelpers } from '../form-creator/form-creator-helpers';

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


  public static isGeneratedFeature(feat: Feature | AttributeListFeature): feat is Feature{
    return feat.attributes;
  }

  public static getValue(feat: Feature | AttributeListFeature, field: Attribute): string | number | (string | number)[] {
    let value = null;
    if (FormHelpers.isGeneratedFeature(feat)) {
      const attr = FormCreatorHelpers.getAttribute(feat, field.key);
      value = attr?.value;
    }else{
      value = feat[field.key] ? feat[field.key] : '';
    }
    return value;
  }

  public static getRemoveFeatureConfirmMessage(
    feature: Feature,
    attributeLabel: string,
    formConfigs: Map<string, FormConfiguration>,
  ): string {
    const formConfig = formConfigs.get(feature.tableName);
    const message = [];
    message.push('Wilt u ' + (formConfig.name || feature.tableName) + ' - ' + attributeLabel + ' verwijderen?');
    if (feature.children && feature.children.length > 0) {
      const childRelations: Map<string, number> = new Map();
      feature.children.forEach(child => {
        childRelations.set(child.tableName, (childRelations.get(child.tableName) || 0) + 1);
      });
      message.push('', 'Let op! Dit object heeft een relatie met:');
      childRelations.forEach((count, tableName) => {
        message.push('', '- ' + (formConfigs.get(tableName)?.name || tableName) + ' (' + count + ')');
      });
      message.push('', 'Deze relaties worden verbroken en object met onderliggende objecten worden verwijderd.');
    }
    return FormHelpers.getTextWithNewlines(message);
  }

  private static getTextWithNewlines(messages: string[]): string {
    return messages.join('\n');
  }

}
