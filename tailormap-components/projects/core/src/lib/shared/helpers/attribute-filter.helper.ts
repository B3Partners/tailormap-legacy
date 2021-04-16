import { AttributeFilterTypeModel } from '../models/attribute-filter-type.model';
import { AttributeTypeEnum } from '../models/attribute-type.enum';
import { AttributeTypeHelper } from '../../application/helpers/attribute-type.helper';
import { AttributeFilterModel } from '../models/attribute-filter.model';

export class AttributeFilterHelper {

  public static UNIQUE_VALUES_KEY = 'UNIQUE_VALUES';

  public static getConditionTypes(includeUniqueValues: boolean = false): AttributeFilterTypeModel[] {
    const types: AttributeFilterTypeModel[] = [
      { condition: '=', label: 'Gelijk aan', readableLabel: 'gelijk is aan', attributeType: AttributeTypeEnum.NUMBER },
      { condition: '>', label: 'Groter dan', readableLabel: 'groter is dan', attributeType: AttributeTypeEnum.NUMBER },
      { condition: '<', label: 'Kleiner dan', readableLabel: 'kleiner is dan', attributeType: AttributeTypeEnum.NUMBER },
      { condition: '>=', label: 'Groter of gelijk aan', readableLabel: 'groter is of gelijk aan', attributeType: AttributeTypeEnum.NUMBER },
      { condition: '<=', label: 'Kleiner of gelijk aan', readableLabel: 'kleiner is of gelijk aan', attributeType: AttributeTypeEnum.NUMBER },
      { condition: 'EQUALS', label: 'Gelijk aan', readableLabel: 'gelijk is aan', attributeType: AttributeTypeEnum.STRING },
      { condition: 'LIKE', label: 'Bevat', readableLabel: 'bevat', attributeType: AttributeTypeEnum.STRING },
      { condition: 'NOT_LIKE', label: 'Bevat niet', readableLabel: 'bevat niet', attributeType: AttributeTypeEnum.STRING },
      { condition: 'STARTS_WITH', label: 'Begint met', readableLabel: 'begint met', attributeType: AttributeTypeEnum.STRING },
      { condition: 'ENDS_WITH', label: 'Eindigt op', readableLabel: 'eindigt op', attributeType: AttributeTypeEnum.STRING },
      { condition: 'ON', label: 'Gelijk aan', readableLabel: 'gelijk is aan', attributeType: AttributeTypeEnum.DATE },
      { condition: 'AFTER', label: 'Na', readableLabel: 'na', attributeType: AttributeTypeEnum.DATE },
      { condition: 'BEFORE', label: 'Voor', readableLabel: 'voor', attributeType: AttributeTypeEnum.DATE },
      { condition: 'TRUE', label: 'Is waar', readableLabel: 'waar is', attributeType: AttributeTypeEnum.BOOLEAN },
      { condition: 'FALSE', label: 'Is niet waar', readableLabel: 'niet waar is', attributeType: AttributeTypeEnum.BOOLEAN },
    ];
    if (includeUniqueValues) {
      types.push({ condition: AttributeFilterHelper.UNIQUE_VALUES_KEY, label: 'Kies waardes', readableLabel: 'bevat 1 van de waardes' });
    }
    return types;
  }

  public static convertFilterToQuery(filter: AttributeFilterModel) {
    let cql: string;
    if (filter.condition === AttributeFilterHelper.UNIQUE_VALUES_KEY) {
      const value = filter.value.map(v => AttributeTypeHelper.getExpression(v, filter.attributeType)).join(',');
      return `(${filter.attribute} IN (${value}))`;
    }
    const value = filter.value[0];
    if (filter.attributeType === AttributeTypeEnum.NUMBER) {
      cql = `${filter.attribute} ${filter.condition} ${value}`;
    }
    if (filter.attributeType === AttributeTypeEnum.STRING) {
      cql = AttributeFilterHelper.getQueryForString(filter);
    }
    if (filter.attributeType === AttributeTypeEnum.DATE) {
      const cond = filter.condition === 'ON' ? '=' : filter.condition === 'AFTER' ? '>' : '<';
      cql = `${filter.attribute} ${cond} ${value}`;
    }
    if (filter.attributeType === AttributeTypeEnum.BOOLEAN) {
      cql = `${filter.attribute} = ${filter.condition === 'TRUE' ? 'true' : 'false'}`;
    }
    if (filter.relatedToFeatureType) {
      return `RELATED_LAYER(${filter.relatedToFeatureType},${filter.featureType},${cql})`;
    }
    return `(${cql})`;
  }

  private static getQueryForString(filter: AttributeFilterModel) {
    const query: string[] = [ filter.attribute ];
    const value = filter.value[0];
    if (filter.condition === 'NOT_LIKE') {
      query.push('NOT');
    }
    query.push('ILIKE');
    if (filter.condition === 'EQUALS') {
      query.push(AttributeTypeHelper.getExpression(`${value}`, AttributeTypeEnum.STRING));
    }
    if (filter.condition === 'LIKE' || filter.condition === 'NOT_LIKE') {
      query.push(AttributeTypeHelper.getExpression(`%${value}%`, AttributeTypeEnum.STRING));
    }
    if (filter.condition === 'STARTS_WITH') {
      query.push(AttributeTypeHelper.getExpression(`${value}%`, AttributeTypeEnum.STRING));
    }
    if (filter.condition === 'ENDS_WITH') {
      query.push(AttributeTypeHelper.getExpression(`%${value}`, AttributeTypeEnum.STRING));
    }
    return `${query.join(' ')}`;
  }

}
