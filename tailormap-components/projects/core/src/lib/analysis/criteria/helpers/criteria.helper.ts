import { CriteriaConditionModel } from '../../models/criteria-condition.model';
import { CriteriaModel } from '../../models/criteria.model';
import { CriteriaGroupModel } from '../../models/criteria-group.model';
import { CriteriaTypeEnum } from '../../models/criteria-type.enum';
import { IdService } from '../../../shared/id-service/id.service';
import { CriteriaOperatorEnum } from '../../models/criteria-operator.enum';
import { AttributeFilterTypeModel } from '../../../shared/models/attribute-filter-type.model';
import { AttributeTypeEnum } from '../../../shared/models/attribute-type.enum';
import { UserLayerStyleModel } from '../../models/user-layer-style.model';
import { StyleHelper } from '../../helpers/style.helper';
import { ScopedUserLayerStyleModel } from '../../models/scoped-user-layer-style.model';
import { AttributeTypeHelper } from '../../../application/helpers/attribute-type.helper';

export class CriteriaHelper {

  public static validGroups(criteriaGroups: CriteriaGroupModel[]) {
    return criteriaGroups.every(group => group.criteria.length >= 1 && group.criteria.every(CriteriaHelper.isValidCriteriaCondition));
  }

  public static isValidCriteriaCondition(criteria: CriteriaConditionModel) {
    return typeof criteria.attributeType !== 'undefined'
      && typeof criteria.attribute !== 'undefined' && criteria.attribute !== ''
      && typeof criteria.condition !== 'undefined' && criteria.condition !== ''
      && typeof criteria.source !== 'undefined' && Number.isInteger(criteria.source)
      && criteria.attributeType === AttributeTypeEnum.BOOLEAN || (typeof criteria.value !== 'undefined' && criteria.value !== '');
  }

  public static getConditionTypes(): AttributeFilterTypeModel[] {
    return [
      { value: '=', label: 'Gelijk aan', readableLabel: 'gelijk is aan', attributeType: AttributeTypeEnum.NUMBER },
      { value: '>', label: 'Groter dan', readableLabel: 'groter is dan', attributeType: AttributeTypeEnum.NUMBER },
      { value: '<', label: 'Kleiner dan', readableLabel: 'kleiner is dan', attributeType: AttributeTypeEnum.NUMBER },
      { value: '>=', label: 'Groter of gelijk aan', readableLabel: 'groter is of gelijk aan', attributeType: AttributeTypeEnum.NUMBER },
      { value: '<=', label: 'Kleiner of gelijk aan', readableLabel: 'kleiner is of gelijk aan', attributeType: AttributeTypeEnum.NUMBER },
      { value: 'EQUALS', label: 'Gelijk aan', readableLabel: 'gelijk is aan', attributeType: AttributeTypeEnum.STRING },
      { value: 'LIKE', label: 'Bevat', readableLabel: 'bevat', attributeType: AttributeTypeEnum.STRING },
      { value: 'NOT_LIKE', label: 'Bevat niet', readableLabel: 'bevat niet', attributeType: AttributeTypeEnum.STRING },
      { value: 'STARTS_WITH', label: 'Begint met', readableLabel: 'begint met', attributeType: AttributeTypeEnum.STRING },
      { value: 'ENDS_WITH', label: 'Eindigt op', readableLabel: 'eindigt op', attributeType: AttributeTypeEnum.STRING },
      { value: 'ON', label: 'Gelijk aan', readableLabel: 'gelijk is aan', attributeType: AttributeTypeEnum.DATE },
      { value: 'AFTER', label: 'Na', readableLabel: 'na', attributeType: AttributeTypeEnum.DATE },
      { value: 'BEFORE', label: 'Voor', readableLabel: 'voor', attributeType: AttributeTypeEnum.DATE },
      { value: 'TRUE', label: 'Is waar', readableLabel: 'waar is', attributeType: AttributeTypeEnum.BOOLEAN },
      { value: 'FALSE', label: 'Is niet waar', readableLabel: 'niet waar is', attributeType: AttributeTypeEnum.BOOLEAN },
    ];
  }

  public static createCriteria(type: CriteriaTypeEnum, groups: CriteriaGroupModel[]): CriteriaModel {
    return {
      type,
      operator: CriteriaOperatorEnum.AND,
      groups,
    };
  }

  public static createCriteriaGroup(idService: IdService, criteriaConditions: CriteriaConditionModel[]): CriteriaGroupModel {
    return {
      id: idService.getUniqueId('criteria-group'),
      operator: CriteriaOperatorEnum.AND,
      criteria: criteriaConditions,
    };
  }

  public static createCriteriaCondition(idService: IdService): CriteriaConditionModel {
    return { id: idService.getUniqueId('criteria') };
  }

  public static convertStyleToQuery(styles: UserLayerStyleModel[]) {
    const attributes = new Map<string, string[]>();
    const isActiveScopedStyle = (style: UserLayerStyleModel): style is ScopedUserLayerStyleModel => {
      return StyleHelper.isScopedStyle(style) && style.active;
    };
    styles.filter(isActiveScopedStyle).forEach(style => {
      const cur = attributes.get(style.attribute) || [];
      attributes.set(style.attribute, cur.concat([ AttributeTypeHelper.getExpression(style.value, style.attributeType) ]));
    });
    const query: string[] = [];
    attributes.forEach((values, attribute) => {
      query.push(`${attribute} IN (${values.join(',')})`);
    });
    return query.join(' AND ');
  }

  public static convertCriteriaToQuery(criteria: CriteriaModel) {
    if (!criteria || !criteria.groups) {
      return '';
    }
    const query = criteria.groups
      .map(CriteriaHelper.convertGroupToQuery)
      .join(` ${criteria.operator} `);
    return `(${query})`;
  }

  private static convertGroupToQuery(criteriaGroup: CriteriaGroupModel) {
    const groupCriteria = criteriaGroup.criteria
      .map(CriteriaHelper.convertConditionToQuery)
      .join(` ${criteriaGroup.operator} `);
    return `(${groupCriteria})`;
  }

  public static convertConditionToQuery(condition: CriteriaConditionModel) {
    let cql: string;
    if (condition.attributeType === AttributeTypeEnum.NUMBER) {
      cql = `${condition.attribute} ${condition.condition} ${condition.value}`;
    }
    if (condition.attributeType === AttributeTypeEnum.STRING) {
      cql = CriteriaHelper.getQueryForString(condition);
    }
    if (condition.attributeType === AttributeTypeEnum.DATE) {
      const cond = condition.condition === 'ON' ? '=' : condition.condition === 'AFTER' ? '>' : '<';
      cql = `${condition.attribute} ${cond} "${condition.value}"`;
    }
    if (condition.attributeType === AttributeTypeEnum.BOOLEAN) {
      cql = `${condition.attribute} = ${condition.condition === 'TRUE' ? 'true' : 'false'}`;
    }
    if (condition.relatedTo) {
      return `RELATED_LAYER(${condition.relatedTo},${condition.source},${cql})`;
    }
    return `(${cql})`;
  }

  private static getQueryForString(condition: CriteriaConditionModel) {
    const query: string[] = [ condition.attribute ];
    if (condition.condition === 'NOT_LIKE') {
      query.push('NOT');
    }
    query.push('ILIKE');
    if (condition.condition === 'EQUALS') {
      query.push(AttributeTypeHelper.getExpression(`${condition.value}`, AttributeTypeEnum.STRING));
    }
    if (condition.condition === 'LIKE' || condition.condition === 'NOT_LIKE') {
      query.push(AttributeTypeHelper.getExpression(`%${condition.value}%`, AttributeTypeEnum.STRING));
    }
    if (condition.condition === 'STARTS_WITH') {
      query.push(AttributeTypeHelper.getExpression(`${condition.value}%`, AttributeTypeEnum.STRING));
    }
    if (condition.condition === 'ENDS_WITH') {
      query.push(AttributeTypeHelper.getExpression(`%${condition.value}`, AttributeTypeEnum.STRING));
    }
    return `${query.join(' ')}`;
  }

}
