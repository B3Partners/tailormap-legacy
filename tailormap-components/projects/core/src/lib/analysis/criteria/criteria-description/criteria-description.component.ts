import { Component, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../../state/analysis.state';
import {
  selectCriteria,
  selectSelectedDataSource,
} from '../../state/analysis.selectors';
import { CriteriaModel } from '../../models/criteria.model';
import { CriteriaGroupModel } from '../../models/criteria-group.model';
import { CriteriaConditionModel } from '../../models/criteria-condition.model';
import {
  combineLatest,
  Observable,
} from 'rxjs';
import { AnalysisSourceModel } from '../../models/analysis-source.model';
import { CriteriaOperatorEnum } from '../../models/criteria-operator.enum';
import { CriteriaHelper } from '../helpers/criteria.helper';
import { map, take } from 'rxjs/operators';
import {
  DomSanitizer,
  SafeHtml,
} from '@angular/platform-browser';
import { AttributeTypeEnum } from '../../../shared/models/attribute-type.enum';
import * as moment from 'moment';
import { MetadataService } from '../../../application/services/metadata.service';
import { AttributeFilterHelper } from '../../../shared/helpers/attribute-filter.helper';
import { METADATA_SERVICE } from '@tailormap/models';

@Component({
  selector: 'tailormap-criteria-description',
  templateUrl: './criteria-description.component.html',
  styleUrls: ['./criteria-description.component.css'],
})
export class CriteriaDescriptionComponent {

  public description$: Observable<SafeHtml>;

  public loadingTotalCount: boolean;
  public totalCount: number;

  constructor(
    private store$: Store<AnalysisState>,
    private sanitizer: DomSanitizer,
    @Inject(METADATA_SERVICE) private metadataService: MetadataService,
  ) {
    this.description$ = combineLatest([
      this.store$.select(selectSelectedDataSource),
      this.store$.select(selectCriteria),
    ]).pipe(
      map(([ selectedSource, criteria ]) => {
        if (!selectedSource || !criteria || !CriteriaHelper.validGroups(criteria.groups)) {
          return null;
        }
        this.updateTotalCount(selectedSource, criteria);
        return this.sanitizer.bypassSecurityTrustHtml(CriteriaDescriptionComponent.convertCriteriaToQuery(selectedSource, criteria));
      }),
    );
  }

  public static convertCriteriaToQuery(
    selectedDatasource: AnalysisSourceModel,
    criteria: CriteriaModel,
  ) {
    const query = criteria.groups
      .map(group => CriteriaDescriptionComponent.convertGroupToQuery(group, criteria.groups.length > 1))
      .join(` ${CriteriaDescriptionComponent.convertOperator(criteria.operator)} `);
    return `Van de laag <strong>${selectedDatasource.label}</strong> wil ik alle objecten zien waarbij ${query}`;
  }

  private static convertGroupToQuery(criteriaGroup: CriteriaGroupModel, hasMultipleGroups: boolean) {
    const groupCriteria = criteriaGroup.criteria
      .map(CriteriaDescriptionComponent.convertConditionToQuery)
      .join(` ${CriteriaDescriptionComponent.convertOperator(criteriaGroup.operator)} `);
    if (criteriaGroup.criteria.length === 1 || !hasMultipleGroups) {
      return groupCriteria;
    }
    return `( ${groupCriteria} )`;
  }

  private static convertConditionToQuery(condition: CriteriaConditionModel) {
    let value = condition.value.join(',');
    if (condition.attributeType === AttributeTypeEnum.DATE) {
      value = condition.value.map(v => moment(v).format('DD-MM-YYYY HH:mm')).join(', ');
    }
    return `<strong>${condition.attributeAlias || condition.attribute}</strong> ${CriteriaDescriptionComponent.convertCondition(condition.condition)} <strong>${value}</strong>`;
  }

  private static convertOperator(operator: CriteriaOperatorEnum) {
    return `<em>${operator === CriteriaOperatorEnum.AND ? 'en' : 'of'}</em>`;
  }

  private static convertCondition(condition: string) {
    return AttributeFilterHelper.getConditionTypes().find(c => c.condition === condition).readableLabel;
  }

  private updateTotalCount(selectedDataSource: AnalysisSourceModel, criteria: CriteriaModel) {
    const query = CriteriaHelper.convertCriteriaToQuery(criteria);
    this.loadingTotalCount = true;
    this.metadataService.getTotalFeaturesForQuery$(selectedDataSource.layerId, query)
      .pipe(take(1))
      .subscribe(total => {
        this.loadingTotalCount = false;
        this.totalCount = total;
      });
  }

}
