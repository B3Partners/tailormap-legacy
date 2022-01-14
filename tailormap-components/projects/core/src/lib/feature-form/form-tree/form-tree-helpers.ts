import { FormTreeMetadata } from './form-tree-models';
import { Feature } from '../../shared/generated';
import { FormHelpers } from '../form/form-helpers';
import { Attribute, FormConfiguration, FormFieldType } from '../form/form-models';
import { AttributeListFeature } from '../../shared/attribute-service/attribute-models';
import { FormFieldHelpers } from '../form-field/form-field-helpers';
import { TreeModel } from '@tailormap/shared';

export class FormTreeHelpers {

  public static convertFeatureToTreeModel(features: Feature[],
                                          formConfigs: Map<string, FormConfiguration>): TreeModel<FormTreeMetadata>[] {
    const nodes: TreeModel[] = [];
    const allChildren: TreeModel[] = [];
    features.forEach(feature => {
      if (feature.children) {
        const fts: Record<string , TreeModel<FormTreeMetadata>> = {};

        feature.children.forEach((child: Feature) => {
          const featureType = child.tableName;
          if (formConfigs.has(featureType)) {
            if (!fts.hasOwnProperty(featureType)) {
              const formConfig = formConfigs.get(featureType);
              const featureTypeNode: TreeModel<FormTreeMetadata> = {
                label: formConfig.name || FormHelpers.capitalize(featureType),
                children: [],
                id: 'featuretype_' + featureType,
                metadata: {
                  isFeatureType: true,
                },
              };
              fts[featureType] = featureTypeNode;
            }
            const children = FormTreeHelpers.convertFeatureToTreeModel([child], formConfigs)[0];
            fts[featureType].children.push(children);
          }
        });
        for (const key in fts) {
          if (fts.hasOwnProperty(key)) {
            const child = fts[key];
            allChildren.push(child);
          }
        }
      }
      const config = formConfigs.get(feature.tableName);
      const metadata = {
        isFeatureType: false,
        feature,
        fid: feature.fid,
      };
      nodes.push({
        label: FormTreeHelpers.getFeatureValueForField(feature, config),
        children: allChildren.length > 0 ? allChildren : undefined,
        id: feature.fid,
        metadata,
      });
    });
    return nodes;
  }

  public static getFeatureValueForField(feat: Feature | AttributeListFeature, config: FormConfiguration, key?: string): string  {
    if (!config) {
      return `${feat[key] || ''}`;
    }
    const featureKey = key || config.treeNodeColumn;
    const attr: Attribute = config.fields.find(field => field.key === featureKey);
    if (!attr) {
      return `${feat[featureKey] || ''}`;
    }
    const value = FormFieldHelpers.getAttributeValue({ ...attr, value: FormHelpers.getValue(feat, attr) });
    if (attr.type === FormFieldType.DOMAIN && attr.options) {
      const option = FormFieldHelpers.findSelectedOption(attr.options, value);
      if (Array.isArray(option)) {
        return option.map(opt => opt.label).join(', ');
      }
      if (option) {
        return option.label;
      }
    }
    return `${value || ''}`;
  }
}
