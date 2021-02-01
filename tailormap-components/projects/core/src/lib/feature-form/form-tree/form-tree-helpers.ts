import {
  FeatureNode,
  FlatNode,
} from './form-tree-models';
import { Feature } from '../../shared/generated';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import { FormHelpers } from '../form/form-helpers';
import { Attribute, FormConfiguration, FormFieldType } from '../form/form-models';
import { AttributeListFeature } from '../../shared/attribute-service/attribute-models';
import { FormFieldHelpers } from '../form-field/form-field-helpers';

export class FormTreeHelpers {

  public static transformer(node: FeatureNode, level: number): FlatNode {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      feature: node.feature,
      isFeatureType: node.isFeatureType,
      selected: node.selected,
    };
  }


  public static convertFeatureToNode(features: Feature[], formConfigRepo: FormconfigRepositoryService,
                                     selectedGuid: string, formConfigs : Map<string, FormConfiguration>): FeatureNode[] {
    const nodes: FeatureNode[] = [];
    features.forEach(feature => {
      const children: FeatureNode[] = [];
      if (feature.children) {
        const fts = {};
        feature.children.forEach((child: Feature) => {
          const featureType = child.clazz;
          if (formConfigs.get(featureType)) {
            if (!fts.hasOwnProperty(featureType)) {
              fts[featureType] = {
                name: FormHelpers.capitalize(featureType),
                children: [],
                id: featureType,
                isFeatureType: true,
              };
            }
            fts[featureType].children.push(FormTreeHelpers.convertFeatureToNode([child], formConfigRepo, selectedGuid, formConfigs)[0]);
          }
        });
        for (const key in fts) {
          if (fts.hasOwnProperty(key)) {
            const child = fts[key];
            children.push(child);
          }
        }
      }
      const config = formConfigs.get(feature.clazz);
      nodes.push({
        name: FormTreeHelpers.getFeatureValueForField(feature, config),
        children,
        objectGuid: feature.objectGuid,
        feature,
        selected: feature.objectGuid === selectedGuid,
        isFeatureType: false,
      });
    });
    return nodes;
  }

  public static getFeatureValueForField(feat: Feature | AttributeListFeature, config : FormConfiguration,
                                        key : string = config.treeNodeColumn): string {
    const attr: Attribute = config.fields.find(field => field.key === key);
    let value = feat[key];
    if (attr.type === FormFieldType.DOMAIN) {
      attr.options.forEach(option => {
        if ((FormFieldHelpers.isNumber(value) && option.val === parseInt('' + value, 10))) {
          value = option.label;
        }
      });
    }
    return value;
  }
}
