import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CriteriaGroupModel } from '../../models/criteria-group.model';
import { CriteriaConditionModel } from '../../models/criteria-condition.model';
import { CriteriaHelper } from '../helpers/criteria.helper';
import { IdService } from '../../../shared/id-service/id.service';
import { CriteriaOperatorEnum } from '../../models/criteria-operator.enum';
import { FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'tailormap-criteria-group',
  templateUrl: './criteria-group.component.html',
  styleUrls: ['./criteria-group.component.css'],
})
export class CriteriaGroupComponent implements OnInit, OnDestroy {

  @Input()
  public criteriaGroup: CriteriaGroupModel;

  @Output()
  public criteriaGroupUpdated: EventEmitter<CriteriaGroupModel> = new EventEmitter<CriteriaGroupModel>();

  @Output()
  public criteriaGroupRemoved: EventEmitter<CriteriaGroupModel> = new EventEmitter<CriteriaGroupModel>();

  public groupOperators = [
    { label: 'AND groep', value: CriteriaOperatorEnum.AND },
    { label: 'OF groep', value: CriteriaOperatorEnum.OR },
  ];

  private hiddenCriteria = new Set<string>();
  public hidden = false;

  public operatorControl = new FormControl(CriteriaOperatorEnum.AND);

  private destroyed = new Subject();

  constructor(
    private idService: IdService,
  ) {}

  public ngOnInit() {
    if (this.criteriaGroup.operator) {
      this.operatorControl.patchValue(this.criteriaGroup.operator);
    }
    this.operatorControl.valueChanges
      .pipe(takeUntil(this.destroyed))
      .subscribe(operator => {
        const updatedGroup: CriteriaGroupModel = {
          ...this.criteriaGroup,
          operator,
        };
        this.criteriaGroup = updatedGroup;
        this.criteriaGroupUpdated.emit(updatedGroup);
      })
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

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
        CriteriaHelper.createCriteriaCondition(this.idService),
        ...this.criteriaGroup.criteria,
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

  public toggleCriteria(id: string) {
    if (this.hiddenCriteria.has(id)) {
      this.hiddenCriteria.delete(id);
    } else {
      this.hiddenCriteria.add(id);
    }
  }

  public showCriteria(id: string) {
    return !this.hiddenCriteria.has(id);
  }

  public toggleGroup() {
    this.hidden = !this.hidden;
  }

  public removeGroup() {
    this.criteriaGroupRemoved.emit(this.criteriaGroup);
  }

}
