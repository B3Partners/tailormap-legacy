import { RelatedFilterDataModel } from '../models/related-filter-data.model';

export class RelatedFilterHelper {

  public static getFilter(
    featureType: number,
    data: RelatedFilterDataModel[],
  ) {
    const filters = new Map(data.filter(d => !!d.filter).map(d => [d.featureType, d.filter]));
    return RelatedFilterHelper.buildTreeFilter(featureType, data, filters);
  }

  private static buildTreeFilter(
    featureType: number,
    tabFeatureData: RelatedFilterDataModel[],
    filters: Map<number, string>,
  ) {
    const featureTypeFilters: string[] = [];
    const featureData = tabFeatureData.find(d => d.featureType === featureType);
    if (!featureData) {
      return [];
    }
    if (filters.has(featureType)) {
      featureTypeFilters.push(filters.get(featureType));
      filters.delete(featureType);
    }
    featureTypeFilters.push(...RelatedFilterHelper.buildFilterForChildren(featureType, tabFeatureData, filters));
    if (featureData.parentFeatureType) {
      featureTypeFilters.push(
        ...RelatedFilterHelper.buildTreeFilter(featureData.parentFeatureType, tabFeatureData, filters)
          .map(filter => `RELATED_FEATURE(${featureType}, ${featureData.parentFeatureType}, (${filter}))`),
      );
    }
    return featureTypeFilters;
  }

  private static buildFilterForChildren(
    parentFeatureType: number,
    allFeatureData: RelatedFilterDataModel[],
    filters: Map<number, string>,
  ): string[] {
    const children = RelatedFilterHelper.getChildren(parentFeatureType, allFeatureData);
    if (children.length === 0) {
      return [];
    }
    const childFilters: string[] = [];
    children.forEach(child => {
      if (filters.has(child.featureType)) {
        childFilters.push(`RELATED_FEATURE(${parentFeatureType}, ${child.featureType}, (${filters.get(child.featureType)}))`);
        filters.delete(child.featureType);
      }
      const childFiltersOfChild = RelatedFilterHelper.buildFilterForChildren(child.featureType, allFeatureData, filters)
        .map(filter => `RELATED_FEATURE(${parentFeatureType}, ${child.featureType}, (${filter}))`);
      childFilters.push(...childFiltersOfChild);
    });
    return childFilters;
  }

  private static getChildren(featureType: number, featureData: RelatedFilterDataModel[]) {
    return featureData.filter(f => f.parentFeatureType === featureType);
  }

}
