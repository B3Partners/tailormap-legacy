import {
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
  setLayerName,
  showCriteriaForm,
} from '../state/analysis.actions';
import {
  debounceTime,
  map,
  takeUntil,
} from 'rxjs/operators';
import {
  combineLatest,
  Observable,
  Subject,
} from 'rxjs';
import {
  selectCanCreateLayer,
  selectCriteria,
  selectIsCreatingCriteria,
  selectIsSelectingDataSource,
  selectLayerName,
  selectSelectedDataSource,
} from '../state/analysis.selectors';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { CriteriaTypeEnum } from '../models/criteria-type.enum';
import { CriteriaModel } from '../models/criteria.model';
import { CriteriaHelper } from '../criteria/helpers/criteria.helper';

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
  public hasActiveSidePanel$: Observable<boolean>;

  public criteria: CriteriaModel;

  public criteriaMode = CriteriaTypeEnum;

  public errorMessage: string;
  private allowCreateLayer: boolean;

  constructor(
    private store$: Store<AnalysisState>,
  ) {
  }

  public ngOnInit() {
    this.store$.select(selectSelectedDataSource).pipe(takeUntil(this.destroyed)).subscribe(selectedDataSource => {
      this.selectedDataSource = selectedDataSource
    });
    this.store$.select(selectCriteria).pipe(takeUntil(this.destroyed)).subscribe(criteria => {
      this.criteria = criteria
    });
    this.store$.select(selectLayerName).pipe(takeUntil(this.destroyed)).subscribe(layerName => {
      this.layerName.patchValue(layerName, { emitEvent: false });
    });
    this.store$.select(selectCanCreateLayer).pipe(takeUntil(this.destroyed)).subscribe(canCreateLayer => {
      this.allowCreateLayer = canCreateLayer;
    });
    this.selectingDataSource$ = this.store$.select(selectIsSelectingDataSource);
    this.creatingCriteria$ = this.store$.select(selectIsCreatingCriteria);
    this.hasActiveSidePanel$ = combineLatest([ this.selectingDataSource$, this.creatingCriteria$ ])
      .pipe(map(([ selectingSource, creatingCriteria ]) => selectingSource || creatingCriteria));
    this.layerName.valueChanges.pipe(debounceTime(500), takeUntil(this.destroyed)).subscribe(name => {
      this.store$.dispatch(setLayerName({ layerName: name }));
    });
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

  public setCriteria(mode: CriteriaTypeEnum) {
    this.store$.dispatch(showCriteriaForm({ criteriaMode: mode }));
  }

  public canCreateLayer() {
    return this.allowCreateLayer;
  }

  public hasCriteria() {
    return !!this.criteria && CriteriaHelper.validGroups(this.criteria.groups);
  }

  public editCriteria() {
    this.store$.dispatch(showCriteriaForm({ criteriaMode: this.criteria.type }));
  }

  public showStylingTab() {
    if (!this.canCreateLayer()) {
      return;
    }
    this.next.emit();
  }

}
