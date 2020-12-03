import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import {
  clearCreateLayerMode,
  selectDataSource,
  showCriteriaForm,
} from '../state/analysis.actions';
import { takeUntil } from 'rxjs/operators';
import {
  Observable,
  Subject,
} from 'rxjs';
import {
  selectCriteria,
  selectIsCreatingCriteria,
  selectIsSelectingDataSource,
  selectSelectedDataSource,
} from '../state/analysis.selectors';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { CriteriaTypeEnum } from '../models/criteria-type.enum';
import { CriteriaModel } from '../models/criteria.model';
import { CriteriaHelper } from '../criteria/helpers/criteria.helper';
import { UserLayerService } from '../services/user-layer.service';

@Component({
  selector: 'tailormap-create-layer-form',
  templateUrl: './create-layer-form.component.html',
  styleUrls: ['./create-layer-form.component.css'],
})
export class CreateLayerFormComponent implements OnInit, OnDestroy {

  @Output()
  public next = new EventEmitter();

  private destroyed = new Subject();

  public layerName = new FormControl('');
  public selectedDataSource: AnalysisSourceModel;

  public selectingDataSource$: Observable<boolean>;
  public creatingCriteria$: Observable<boolean>;
  public criteria: CriteriaModel;

  constructor(
    private store$: Store<AnalysisState>,
    private userLayerService: UserLayerService,
  ) {
  }

  public ngOnInit() {
    this.store$.select(selectSelectedDataSource).pipe(takeUntil(this.destroyed)).subscribe(selectedDataSource => {
      this.selectedDataSource = selectedDataSource
    });
    this.store$.select(selectCriteria).pipe(takeUntil(this.destroyed)).subscribe(criteria => {
      this.criteria = criteria
    });
    this.selectingDataSource$ = this.store$.select(selectIsSelectingDataSource);
    this.creatingCriteria$ = this.store$.select(selectIsCreatingCriteria);

  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public cancelCreateLayer() {
    this.store$.dispatch(clearCreateLayerMode());
  }

  public selectDataSource() {
    this.store$.dispatch(selectDataSource({ selectDataSource: true }));
  }

  public setCriteria() {
    this.store$.dispatch(showCriteriaForm({ criteriaMode: CriteriaTypeEnum.SIMPLE }));
  }

  public canCreateLayer() {
    return !!this.selectedDataSource && !!this.criteria && this.layerName.value;
  }

  public createLayer() {
    if (!this.canCreateLayer()) {
      return;
    }
    const query = CriteriaHelper.convertCriteriaToQuery(this.criteria);
    this.userLayerService.createUserLayer$(
      this.layerName.value,
      `${this.selectedDataSource.layerId}`,
      query,
    ).subscribe();
  }

}
