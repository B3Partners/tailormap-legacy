import { CriteriaConditionModel } from '../../models/criteria-condition.model';
import { CriteriaModel } from '../../models/criteria.model';
import { CriteriaGroupModel } from '../../models/criteria-group.model';
import { CriteriaTypeEnum } from '../../models/criteria-type.enum';
import { IdService } from '../../../shared/id-service/id.service';
import { CriteriaOperatorEnum } from '../../models/criteria-operator.enum';
import { AttributeTypeEnum } from '../../../shared/models/attribute-type.enum';
import { UserLayerStyleModel } from '../../models/user-layer-style.model';
import { StyleHelper } from '../../helpers/style.helper';
import { ScopedUserLayerStyleModel } from '../../models/scoped-user-layer-style.model';
import { AttributeTypeHelper } from '../../../application/helpers/attribute-type.helper';
import { AttributeFilterHelper } from '../../../shared/helpers/attribute-filter.helper';
import { AttributeFilterModel } from '../../../shared/models/attribute-filter.model';

export class CriteriaHelper {

  public static validGroups(criteriaGroups: CriteriaGroupModel[]) {
    return criteriaGroups.every(group => group.criteria.length >= 1 && group.criteria.every(CriteriaHelper.isValidCriteriaCondition));
  }

  public static isValidCriteriaCondition(criteria: CriteriaConditionModel) {
    return typeof criteria.attributeType !== 'undefined'
      && typeof criteria.attribute !== 'undefined' && criteria.attribute !== ''
      && typeof criteria.condition !== 'undefined' && criteria.condition !== ''
      && typeof criteria.source !== 'undefined' && Number.isInteger(criteria.source)
      && criteria.attributeType === AttributeTypeEnum.BOOLEAN || (typeof criteria.value !== 'undefined' && criteria.value.join('') !== '');
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
    const attributeFilterCondition: AttributeFilterModel = {
      featureType: condition.source,
      attribute: condition.attribute,
      condition: condition.condition,
      value: condition.value,
      relatedToFeatureType: condition.relatedTo,
      attributeType: condition.attributeType,
    };
    return AttributeFilterHelper.convertFilterToQuery(attributeFilterCondition);
  }

}
