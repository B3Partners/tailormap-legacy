import {
  Component,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../../state/analysis.state';
import { IdService } from '../../../shared/id-service/id.service';
import { selectCriteria } from '../../state/analysis.selectors';
import {
  map,
  takeUntil,
} from 'rxjs/operators';
import { CriteriaTypeEnum } from '../../models/criteria-type.enum';
import { CriteriaModel } from '../../models/criteria.model';
import { CriteriaHelper } from '../helpers/criteria.helper';
import {
  createCriteria,
  removeCriteria,
  showCriteriaForm,
} from '../../state/analysis.actions';
import { CriteriaGroupModel } from '../../models/criteria-group.model';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { Subject } from 'rxjs';
import {
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'tailormap-advanced-criteria',
  templateUrl: './advanced-criteria.component.html',
  styleUrls: ['./advanced-criteria.component.css'],
})
export class AdvancedCriteriaComponent implements OnDestroy {

  public criteria: CriteriaModel;
  public saveButtonEnabled = false;

  private destroyed = new Subject();

  constructor(
    private store$: Store<AnalysisState>,
    private idService: IdService,
    private confirmService: ConfirmDialogService,
  ) {
    this.store$.select(selectCriteria)
      .pipe(
        map((criteria): CriteriaModel => {
          if (!!criteria && criteria.type === CriteriaTypeEnum.ADVANCED &&
            criteria.groups.length >= 1) {
            return criteria;
          }
          return CriteriaHelper.createCriteria(
            CriteriaTypeEnum.ADVANCED,
            [ CriteriaHelper.createCriteriaGroup(this.idService, [ CriteriaHelper.createCriteriaCondition(this.idService) ]) ],
          );
        }),
      )
      .subscribe(criteria => {
        this.criteria = criteria;
        this.saveButtonEnabled = CriteriaHelper.validGroups(this.criteria.groups);
      });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public getGroupId(idx: number, group: CriteriaGroupModel) {
    return group.id;
  }

  public closePanel() {
    this.store$.dispatch(showCriteriaForm({ criteriaMode: null }));
  }

  public save() {
    if (!CriteriaHelper.validGroups(this.criteria.groups)) {
      return;
    }
    this.store$.dispatch(createCriteria({ criteria: this.criteria }));
  }

  public remove() {
    this.store$.dispatch(removeCriteria());
  }

  public groupChanged(group: CriteriaGroupModel) {
    this.updateRemoveGroup(group.id, group);
  }

  public addGroup() {
    this.criteria = {
      ...this.criteria,
      groups: [
        CriteriaHelper.createCriteriaGroup(this.idService, [ CriteriaHelper.createCriteriaCondition(this.idService) ]),
        ...this.criteria.groups,
      ],
    }
  }

  public removeGroup(group: CriteriaGroupModel) {
    this.confirmService.confirm$(
      'Groep verwijderen?',
      'Wilt u deze criterium groep verwijderen? Alle criteria in deze groep zullen verwijderd worden.',
      true,
    )
      .pipe(takeUntil(this.destroyed))
      .subscribe(ok => {
        if (ok) {
          this.updateRemoveGroup(group.id);
        }
      })
  }

  private updateRemoveGroup(groupId: string, updatedGroup?: CriteriaGroupModel) {
    const idx = this.criteria.groups.findIndex(g => g.id === groupId);
    if (idx === -1) {
      return;
    }
    this.criteria = {
      ...this.criteria,
      groups: this.criteria.groups.slice(0, idx)
        .concat(!updatedGroup ? [] : [updatedGroup])
        .concat(this.criteria.groups.slice(idx + 1)),
    };
    this.saveButtonEnabled = CriteriaHelper.validGroups(this.criteria.groups);
  }

  public drop($event: CdkDragDrop<CriteriaGroupModel>) {
    const criteriaGroups = [ ...this.criteria.groups ];
    moveItemInArray(criteriaGroups, $event.previousIndex, $event.currentIndex);
    this.criteria = {
      ...this.criteria,
      groups: criteriaGroups,
    };
  }

}
