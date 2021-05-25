import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { AttributeFilterHelper } from '../../../shared/helpers/attribute-filter.helper';
import { RelatedFilterHelper } from '../../../shared/helpers/related-filter.helper';
import { RelatedFilterDataModel } from '../../../shared/models/related-filter-data.model';
import { AttributeTypeHelper } from '../../../application/helpers/attribute-type.helper';

export class AttributeListFilterHelper {

  public static getFilter(
    tab: AttributeListTabModel,
    featureType: number,
    tabFeatureData: AttributeListFeatureTypeData[],
    extraLayerFilters?: string,
  ): string {
    const filterData: RelatedFilterDataModel[] = tabFeatureData.map<RelatedFilterDataModel>(featureData => {
      const filter = [featureData.filter.map(f => AttributeFilterHelper.convertFilterToQuery(f)).join(' AND ')];
      if (featureData.featureType === tab.featureType && extraLayerFilters) {
        filter.push(extraLayerFilters);
      }
      const checkedRowsFilter = AttributeListFilterHelper.getQueryForCheckedRows(featureData);
      if (checkedRowsFilter) {
        filter.push(checkedRowsFilter);
      }
      return {
        featureType: featureData.featureType,
        parentFeatureType: featureData.parentFeatureType,
        filter: filter.filter(f => !!f).join(' AND '),
      };
    });
    return RelatedFilterHelper.getFilter(featureType, filterData).filter(f => !!f).join(' AND ');
  }

  private static getQueryForCheckedRows(
    featureData: AttributeListFeatureTypeData,
  ): string {
    if (!featureData.primaryKeyColumn) {
      return '';
    }
    const primaryColumn = featureData.columns.find(c => c.name === featureData.primaryKeyColumn);
    if (!primaryColumn || !primaryColumn.attributeType) {
      return '';
    }
    const checkedFeatureKeys = new Set<string>();
    featureData.checkedFeatures.forEach(checkedFeature => {
      if (checkedFeature[featureData.primaryKeyColumn]) {
        checkedFeatureKeys.add(AttributeTypeHelper.getExpression(`${checkedFeature[featureData.primaryKeyColumn]}`, primaryColumn.attributeType));
      }
    });
    if (checkedFeatureKeys.size !== 0) {
      return `(${featureData.primaryKeyColumn} IN (${Array.from(checkedFeatureKeys).join(',')}))`;
    }
    return '';
  }

}
