import {
  FeatureNode,
  FlatNode,
} from './form-tree-models';
import { Feature } from '../../shared/generated';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import { FormHelpers } from '../form/form-helpers';

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
                                     selectedGuid: string): FeatureNode[] {
    const nodes: FeatureNode[] = [];
    features.forEach(feature => {
      const children: FeatureNode[] = [];
      if (feature.children) {
        const fts = {};
        feature.children.forEach((child: Feature) => {
          const featureType = child.clazz;
          if (formConfigRepo.getFormConfig(featureType)) {
            if (!fts.hasOwnProperty(featureType)) {
              fts[featureType] = {
                name: FormHelpers.capitalize(featureType),
                children: [],
                id: featureType,
                isFeatureType: true,
              };
            }
            fts[featureType].children.push(FormTreeHelpers.convertFeatureToNode([child], formConfigRepo, selectedGuid)[0]);
          }
        });
        for (const key in fts) {
          if (fts.hasOwnProperty(key)) {
            const child = fts[key];
            children.push(child);
          }
        }
      }
      nodes.push({
        name: formConfigRepo.getFeatureLabel(feature),
        children,
        objectGuid: feature.objectGuid,
        feature,
        selected: feature.objectGuid === selectedGuid,
        isFeatureType: false,
      });
    });
    return nodes;
  }
}
