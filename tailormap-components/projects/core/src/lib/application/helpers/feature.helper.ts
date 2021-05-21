import { Feature } from '../../shared/generated';

export class FeatureHelper {
  public static convertNewFeaturesToGBI(features: Feature[]): void {
    features.map(feature => FeatureHelper.convertNewFeatureToGBI(feature));
  }

  public static convertNewFeatureToGBI(feature: Feature): void {
    feature.attributes.forEach(row => {
      feature[row.key] = row.value
    });
    if(feature.children){
      FeatureHelper.convertNewFeaturesToGBI(feature.children);
    }
  }

  public static convertGBIFeaturesToFeatures(feats: Feature[]): Feature[] {
    return feats.map(feat => this.convertGBIFeatureToFeature(feat));
  }

  public static convertGBIFeatureToFeature(feat: Feature): Feature {
    let newFeature: Feature = {
      attributes: [],
      children: feat.children,
      clazz: feat.clazz,
      defaultGeometry: feat.defaultGeometry,
      defaultGeometryField: feat.defaultGeometryField,
      fid: feat.fid,
      objecttype: feat.objecttype,
      relatedFeatureTypes: feat.relatedFeatureTypes,
      relations: feat.relations,
    };
    for (let key in feat) {
      if (!newFeature.hasOwnProperty(key)) {
        const attr = {
          key,
          value: feat[key],
        };
        newFeature.attributes.push(attr);
      }
    }
    return newFeature;
  }

}
