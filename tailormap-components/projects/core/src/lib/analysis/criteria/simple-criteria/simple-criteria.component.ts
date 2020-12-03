import { Component } from '@angular/core';
import { CriteriaConditionModel } from '../../models/criteria-condition.model';
import { CriteriaHelper } from '../helpers/criteria.helper';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../../state/analysis.state';
import {
  createCriteria,
  removeCriteria,
  showCriteriaForm,
} from '../../state/analysis.actions';
import { CriteriaModel } from '../../models/criteria.model';
import { CriteriaTypeEnum } from '../../models/criteria-type.enum';
import { CriteriaOperatorEnum } from '../../models/criteria-operator.enum';
import { selectCriteria } from '../../state/analysis.selectors';
import {
  filter,
  map,
} from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'tailormap-simple-criteria',
  templateUrl: './simple-criteria.component.html',
  styleUrls: ['./simple-criteria.component.css', '../../../application/style/application-tree.css'],
})
export class SimpleCriteriaComponent {

  public criteria$: Observable<CriteriaConditionModel>;
  public saveButtonEnabled: boolean;

  private criteriaFormValues: CriteriaConditionModel;

  constructor(
    private store$: Store<AnalysisState>,
  ) {
    this.criteria$ = this.store$.select(selectCriteria)
      .pipe(
        filter(criteria => {
          return !!criteria && criteria.type === CriteriaTypeEnum.SIMPLE &&
            criteria.groups.length === 1 &&
            criteria.groups[0].criteria.length === 1;
        }),
        map(criteria => criteria.groups[0].criteria[0]),
      );
  }

  public closePanel() {
    this.store$.dispatch(showCriteriaForm({ criteriaMode: null }));
  }

  public save() {
    if (!CriteriaHelper.isValidCriteriaCondition(this.criteriaFormValues)) {
      return;
    }
    const criteria: CriteriaModel = {
      type: CriteriaTypeEnum.SIMPLE,
      operator: CriteriaOperatorEnum.AND,
      groups: [{
        criteria: [ this.criteriaFormValues ],
        operator: CriteriaOperatorEnum.AND,
      }],
    }
    this.store$.dispatch(createCriteria({ criteria }));
  }

  public remove() {
    this.store$.dispatch(removeCriteria());
  }

  public criteriaChanged(criteria: CriteriaConditionModel) {
    this.criteriaFormValues = criteria;
    this.saveButtonEnabled = CriteriaHelper.isValidCriteriaCondition(criteria);
  }

}
