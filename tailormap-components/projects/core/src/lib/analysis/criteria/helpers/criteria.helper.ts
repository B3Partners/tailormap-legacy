import { CriteriaConditionModel } from '../../models/criteria-condition.model';
import { CriteriaModel } from '../../models/criteria.model';
import { CriteriaGroupModel } from '../../models/criteria-group.model';
import { CriteriaTypeEnum } from '../../models/criteria-type.enum';
import { IdService } from '../../../shared/id-service/id.service';
import { CriteriaOperatorEnum } from '../../models/criteria-operator.enum';
import { CriteriaConditionTypeModel } from '../../models/criteria-condition-type.model';
import { Attribute } from '../../../shared/attribute-service/attribute-models';
import { AttributeTypeEnum } from '../../models/attribute-type.enum';

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

  public static getConditionTypes(): CriteriaConditionTypeModel[] {
    return [
      { value: '=', label: 'Gelijk aan', readable_label: 'gelijk is aan', attributeType: AttributeTypeEnum.NUMBER },
      { value: '>', label: 'Groter dan', readable_label: 'groter is dan', attributeType: AttributeTypeEnum.NUMBER },
      { value: '<', label: 'Kleiner dan', readable_label: 'kleiner is dan', attributeType: AttributeTypeEnum.NUMBER },
      { value: '>=', label: 'Groter of gelijk aan', readable_label: 'groter is of gelijk aan', attributeType: AttributeTypeEnum.NUMBER },
      { value: '<=', label: 'Kleiner of gelijk aan', readable_label: 'kleiner is of gelijk aan', attributeType: AttributeTypeEnum.NUMBER },
      { value: 'EQUALS', label: 'Gelijk aan', readable_label: 'gelijk is aan', attributeType: AttributeTypeEnum.STRING },
      { value: 'LIKE', label: 'Bevat', readable_label: 'bevat', attributeType: AttributeTypeEnum.STRING },
      { value: 'NOT_LIKE', label: 'Bevat niet', readable_label: 'bevat niet', attributeType: AttributeTypeEnum.STRING },
      { value: 'STARTS_WITH', label: 'Begint met', readable_label: 'begint met', attributeType: AttributeTypeEnum.STRING },
      { value: 'ENDS_WITH', label: 'Eindigt op', readable_label: 'eindigt op', attributeType: AttributeTypeEnum.STRING },
      { value: 'ON', label: 'Gelijk aan', readable_label: 'gelijk is aan', attributeType: AttributeTypeEnum.DATE },
      { value: 'AFTER', label: 'Na', readable_label: 'na', attributeType: AttributeTypeEnum.DATE },
      { value: 'BEFORE', label: 'Voor', readable_label: 'voor', attributeType: AttributeTypeEnum.DATE },
      { value: 'TRUE', label: 'Is waar', readable_label: 'waar is', attributeType: AttributeTypeEnum.BOOLEAN },
      { value: 'FALSE', label: 'Is niet waar', readable_label: 'niet waar is', attributeType: AttributeTypeEnum.BOOLEAN },
    ];
  }

  public static getAttributeType(attribute?: Attribute): AttributeTypeEnum {
    if (!attribute) {
      return undefined;
    }
    if (attribute.type === 'string') {
      return AttributeTypeEnum.STRING;
    }
    if (attribute.type === 'double' || attribute.type === 'integer') {
      return AttributeTypeEnum.NUMBER;
    }
    if (attribute.type === 'boolean') {
      return AttributeTypeEnum.BOOLEAN;
    }
    if (attribute.type === 'date' || attribute.type === 'timestamp') {
      return AttributeTypeEnum.DATE;
    }
    return undefined;
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

  public static convertCriteriaToQuery(criteria: CriteriaModel) {
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
    if (condition.attributeType === AttributeTypeEnum.NUMBER) {
      return `(${condition.attribute} ${condition.condition} ${condition.value})`;
    }
    if (condition.attributeType === AttributeTypeEnum.STRING) {
      return CriteriaHelper.getQueryForString(condition);
    }
    if (condition.attributeType === AttributeTypeEnum.DATE) {
      const cond = condition.condition === 'ON' ? '=' : condition.condition === 'AFTER' ? '>' : '<';
      return `(${condition.attribute} ${cond} "${condition.value}")`
    }
    if (condition.attributeType === AttributeTypeEnum.BOOLEAN) {
      return `(${condition.attribute} = ${condition.condition === 'TRUE' ? 'true' : 'false'})`
    }
  }

  private static getQueryForString(condition: CriteriaConditionModel) {
    const query: string[] = [ condition.attribute ];
    if (condition.condition === 'NOT_LIKE') {
      query.push('NOT');
    }
    query.push('ILIKE');
    if (condition.condition === 'EQUALS') {
      query.push(`'${condition.value}'`);
    }
    if (condition.condition === 'LIKE' || condition.condition === 'NOT_LIKE') {
      query.push(`'*${condition.value}*'`);
    }
    if (condition.condition === 'STARTS_WITH') {
      query.push(`'${condition.value}*'`);
    }
    if (condition.condition === 'ENDS_WITH') {
      query.push(`'*${condition.value}'`);
    }
    return `(${query.join(' ')})`;
  }
}
