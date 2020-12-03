import { CriteriaConditionModel } from './criteria-condition.model';
import { CriteriaOperatorEnum } from './criteria-operator.enum';

export interface CriteriaGroupModel {
  criteria: CriteriaConditionModel[];
  operator: CriteriaOperatorEnum;
}
