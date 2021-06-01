import { FormTreeMetadata } from './form-tree-models';
import { Feature } from '../../shared/generated';
import { FormHelpers } from '../form/form-helpers';
import { Attribute, FormConfiguration, FormFieldType } from '../form/form-models';
import { AttributeListFeature } from '../../shared/attribute-service/attribute-models';
import { FormFieldHelpers } from '../form-field/form-field-helpers';
import { TreeModel } from '../../shared/tree/models/tree.model';
import { LayerUtils } from '../../shared/layer-utils/layer-utils.service';
import { FormCreatorHelpers } from '../form-creator/form-creator-helpers';

export class FormTreeHelpers {

  public static convertFeatureToTreeModel(features: Feature[],
                                          formConfigs: Map<string, FormConfiguration>): TreeModel<FormTreeMetadata>[] {
    const nodes: TreeModel[] = [];
    const allChildren: TreeModel[] = [];
    features.forEach(feature => {
      if (feature.children) {
        const fts: Record<string , TreeModel<FormTreeMetadata>> = {};

        feature.children.forEach((child: Feature) => {
          const featureType = LayerUtils.sanitizeLayername(child.clazz);
          if (formConfigs.has(featureType)) {
            if (!fts.hasOwnProperty(featureType)) {
              const featureTypeNode: TreeModel<FormTreeMetadata> = {
                label: FormHelpers.capitalize(featureType),
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
      const config = formConfigs.get(LayerUtils.sanitizeLayername(feature.clazz));
      const metadata = {
        isFeatureType: false,
        feature,
        objectGuid: feature.fid,
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

  public static getFeatureValueForField(feat: Feature | AttributeListFeature, config: FormConfiguration,
                                        key: string = config.treeNodeColumn): string  {
    const attr: Attribute = config.fields.find(field => field.key === key);
    let value = null;
    if (FormHelpers.isGeneratedFeature(feat)){
      const field = FormCreatorHelpers.getAttribute(feat, key);
      value = field?.value;
    }else{
      value = feat[key];
    }

    if (attr.type === FormFieldType.DOMAIN) {
      attr.options.forEach(option => {
        if ((FormFieldHelpers.isNumber(value) && option.val === parseInt('' + value, 10))) {
          value = option.label;
        }
      });
    }
    return '' + value;
  }
}
