import { CriteriaConditionModel } from '../../models/criteria-condition.model';
import { CriteriaModel } from '../../models/criteria.model';
import { CriteriaGroupModel } from '../../models/criteria-group.model';

export class CriteriaHelper {

  public static isValidCriteriaCondition(criteria: CriteriaConditionModel) {
    return typeof criteria.attribute !== 'undefined' && criteria.attribute !== ''
      && typeof criteria.condition !== 'undefined' && criteria.condition !== ''
      && typeof criteria.source !== 'undefined' && Number.isInteger(criteria.source)
      && typeof criteria.value !== 'undefined' && criteria.value !== '';
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
