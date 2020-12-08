import { CriteriaConditionModel } from './criteria-condition.model';
import { CriteriaOperatorEnum } from './criteria-operator.enum';

export interface CriteriaGroupModel {
  id: string;
  criteria: CriteriaConditionModel[];
  operator: CriteriaOperatorEnum;
}
