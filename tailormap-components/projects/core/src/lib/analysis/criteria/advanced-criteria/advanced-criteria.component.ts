import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../../state/analysis.state';
import { IdService } from '../../../shared/id-service/id.service';
import { selectCriteria } from '../../state/analysis.selectors';
import { map } from 'rxjs/operators';
import { CriteriaTypeEnum } from '../../models/criteria-type.enum';
import { CriteriaModel } from '../../models/criteria.model';
import { CriteriaHelper } from '../helpers/criteria.helper';
import {
  createCriteria,
  removeCriteria,
  showCriteriaForm,
} from '../../state/analysis.actions';
import { CriteriaGroupModel } from '../../models/criteria-group.model';

@Component({
  selector: 'tailormap-advanced-criteria',
  templateUrl: './advanced-criteria.component.html',
  styleUrls: ['./advanced-criteria.component.css'],
})
export class AdvancedCriteriaComponent {

  public criteria: CriteriaModel;
  public saveButtonEnabled = false;

  constructor(
    private store$: Store<AnalysisState>,
    private idService: IdService,
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
      });
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
    const idx = this.criteria.groups.findIndex(g => g.id === group.id);
    if (idx === -1) {
      return;
    }
    this.criteria = {
      ...this.criteria,
      groups: [
        ...this.criteria.groups.slice(0, idx),
        group,
        ...this.criteria.groups.slice(idx + 1),
      ],
    };
    this.saveButtonEnabled = CriteriaHelper.validGroups(this.criteria.groups);
  }

}
