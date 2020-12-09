import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CriteriaGroupModel } from '../../models/criteria-group.model';
import { CriteriaConditionModel } from '../../models/criteria-condition.model';
import { CriteriaHelper } from '../helpers/criteria.helper';
import { IdService } from '../../../shared/id-service/id.service';

@Component({
  selector: 'tailormap-criteria-group',
  templateUrl: './criteria-group.component.html',
  styleUrls: ['./criteria-group.component.css'],
})
export class CriteriaGroupComponent {

  @Input()
  public criteriaGroup: CriteriaGroupModel;

  @Output()
  public criteriaGroupUpdated: EventEmitter<CriteriaGroupModel> = new EventEmitter<CriteriaGroupModel>();

  constructor(
    private idService: IdService,
  ) {}

  public getCriteriaId(idx: number, criteria: CriteriaConditionModel) {
    return criteria.id;
  }

  public criteriaChanged(criteria: CriteriaConditionModel) {
    this.updateRemoveGroup(criteria);
  }

  public criteriaRemoved(criteria: CriteriaConditionModel) {
    this.updateRemoveGroup(criteria, true);
  }

  public addCriteria() {
    const updatedGroup: CriteriaGroupModel = {
      ...this.criteriaGroup,
      criteria: [
        ...this.criteriaGroup.criteria,
        CriteriaHelper.createCriteriaCondition(this.idService),
      ],
    };
    this.criteriaGroup = updatedGroup;
    this.criteriaGroupUpdated.emit(updatedGroup);
  }

  private updateRemoveGroup(criteria: CriteriaConditionModel, remove?: boolean) {
    const criteriaIdx = this.criteriaGroup.criteria.findIndex(c => c.id === criteria.id);
    if (criteriaIdx === -1) {
      return;
    }
    const updatedGroup: CriteriaGroupModel = {
      ...this.criteriaGroup,
      criteria: this.criteriaGroup.criteria.slice(0, criteriaIdx)
        .concat(remove ? [] : [criteria])
        .concat(this.criteriaGroup.criteria.slice(criteriaIdx + 1)),
    };
    this.criteriaGroup = updatedGroup;
    this.criteriaGroupUpdated.emit(updatedGroup);
  }

}
