import { CriteriaTypeEnum } from './criteria-type.enum';
import { CriteriaGroupModel } from './criteria-group.model';
import { CriteriaOperatorEnum } from './criteria-operator.enum';

export interface CriteriaModel {
  type: CriteriaTypeEnum;
  groups: CriteriaGroupModel[];
  operator: CriteriaOperatorEnum;
}
