import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { AttributeFilterHelper } from '../../../shared/helpers/attribute-filter.helper';
import { RelatedFilterHelper } from '../../../shared/helpers/related-filter.helper';
import { RelatedFilterDataModel } from '../../../shared/models/related-filter-data.model';
import { AttributeTypeHelper } from '../../../application/helpers/attribute-type.helper';
import { AttributeTypeEnum } from '../../../shared/models/attribute-type.enum';

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
      const checkedRowsFilter = AttributeListFilterHelper.getQueryForCheckedRows(featureData, tabFeatureData);
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
    parentsFeatureData: AttributeListFeatureTypeData[],
  ): string {
    if (typeof featureData.parentFeatureType === 'undefined' || typeof featureData.parentAttributeRelationKeys === 'undefined') {
      return '';
    }
    const selectedRowsFilter = [];
    const parentFeature = parentsFeatureData.find(f => f.featureType === featureData.parentFeatureType);
    if (!parentFeature) {
      return '';
    }
    featureData.parentAttributeRelationKeys.forEach(relationKey => {
      const checkedFeatureKeys = new Set<string>();
      parentFeature.checkedFeatures.forEach(checkedFeature => {
        if (checkedFeature[relationKey.parentAttribute]) {
          checkedFeatureKeys.add(AttributeTypeHelper.getExpression(`${checkedFeature[relationKey.parentAttribute]}`, AttributeTypeEnum.STRING));
        }
      });
      if (checkedFeatureKeys.size !== 0) {
        selectedRowsFilter.push(`${relationKey.childAttribute} IN (${Array.from(checkedFeatureKeys).join(',')})`);
      }
    });
    if (selectedRowsFilter.length === 0) {
      return '';
    }
    return `(${selectedRowsFilter.join(' AND ')})`;
  }

}
