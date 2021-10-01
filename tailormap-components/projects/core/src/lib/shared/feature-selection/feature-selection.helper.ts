import { Feature } from '../generated';

export class FeatureSelectionHelper {

  public static getUniqueFeatures(features: Feature[]): Feature[] {
    if (!features || features.length === 0) {
      return [];
    }
    const fidList = new Set<string>();
    const uniqueFeatures: Feature[] = [];
    features.forEach(feature => {
      if (!fidList.has(feature.fid)) {
        fidList.add(feature.fid);
        uniqueFeatures.push(feature);
      }
    });
    return uniqueFeatures;
  }

}
