import { CriteriaConditionModel } from '../../models/criteria-condition.model';
import { CriteriaModel } from '../../models/criteria.model';
import { CriteriaGroupModel } from '../../models/criteria-group.model';
import { CriteriaTypeEnum } from '../../models/criteria-type.enum';
import { IdService } from '../../../shared/id-service/id.service';
import { CriteriaOperatorEnum } from '../../models/criteria-operator.enum';
import { CriteriaConditionTypeModel } from '../../models/criteria-condition-type.model';

export class CriteriaHelper {

  public static validGroups(criteriaGroups: CriteriaGroupModel[]) {
    return criteriaGroups.every(group => group.criteria.length >= 1 && group.criteria.every(CriteriaHelper.isValidCriteriaCondition));
  }

  public static isValidCriteriaCondition(criteria: CriteriaConditionModel) {
    return typeof criteria.attribute !== 'undefined' && criteria.attribute !== ''
      && typeof criteria.condition !== 'undefined' && criteria.condition !== ''
      && typeof criteria.source !== 'undefined' && Number.isInteger(criteria.source)
      && typeof criteria.value !== 'undefined' && criteria.value !== '';
  }

  public static getConditionTypes(): CriteriaConditionTypeModel[] {
    return [
      { value: '=', label: 'Gelijk aan', translated_label: 'gelijk is aan', attributeType: 'number' },
      { value: '>', label: 'Groter dan', translated_label: 'groter is dan', attributeType: 'number' },
      { value: '<', label: 'Kleiner dan', translated_label: 'kleiner is dan', attributeType: 'number' },
      { value: '>=', label: 'Groter of gelijk aan', translated_label: 'groter is of gelijk aan', attributeType: 'number' },
      { value: '<=', label: 'Kleiner of gelijk aan', translated_label: 'kleiner is of gelijk aan', attributeType: 'number' },
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

  private static convertConditionToQuery(condition: CriteriaConditionModel) {
    return `(${condition.attribute} ${condition.condition} ${condition.value})`;
  }

}
