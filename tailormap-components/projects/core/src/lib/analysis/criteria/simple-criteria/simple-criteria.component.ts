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
import { CriteriaTypeEnum } from '../../models/criteria-type.enum';
import { selectCriteria } from '../../state/analysis.selectors';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IdService } from '../../../shared/id-service/id.service';

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
    private idService: IdService,
  ) {
    this.criteria$ = this.store$.select(selectCriteria)
      .pipe(
        map((criteria): CriteriaConditionModel => {
          if (!!criteria && criteria.type === CriteriaTypeEnum.SIMPLE &&
            criteria.groups.length === 1 &&
            criteria.groups[0].criteria.length === 1) {
            return criteria.groups[0].criteria[0];
          }
          return CriteriaHelper.createCriteriaCondition(this.idService);
        }),
      );
  }

  public closePanel() {
    this.store$.dispatch(showCriteriaForm({ criteriaMode: null }));
  }

  public save() {
    if (!CriteriaHelper.isValidCriteriaCondition(this.criteriaFormValues)) {
      return;
    }
    const criteria = CriteriaHelper.createCriteria(
      CriteriaTypeEnum.SIMPLE,
      [ CriteriaHelper.createCriteriaGroup(this.idService, [ this.criteriaFormValues ]) ],
    );
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
