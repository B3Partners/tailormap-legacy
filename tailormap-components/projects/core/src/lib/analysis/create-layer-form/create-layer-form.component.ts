import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { clearCreateLayerMode, selectDataSource, setLayerName } from '../state/analysis.actions';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, Subject } from 'rxjs';
import {
  selectCanCreateLayer, selectCreateLayerErrorMessage, selectCreateLayerMode, selectIsCreatingCriteria, selectIsSelectingDataSource,
  selectLayerName, selectSelectedDataSource,
} from '../state/analysis.selectors';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';

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
  public hasActiveSidePanel$: Observable<boolean>;

  public errorMessage$: Observable<string>;
  private allowCreateLayer: boolean;
  public createLayerMode: CreateLayerModeEnum;

  constructor(
    private store$: Store<AnalysisState>,
  ) {
  }

  public ngOnInit() {
    this.store$.select(selectSelectedDataSource).pipe(takeUntil(this.destroyed)).subscribe(selectedDataSource => {
      this.selectedDataSource = selectedDataSource
    });
    this.store$.select(selectLayerName).pipe(takeUntil(this.destroyed)).subscribe(layerName => {
      this.layerName.patchValue(layerName, { emitEvent: false });
    });
    this.store$.select(selectCanCreateLayer).pipe(takeUntil(this.destroyed)).subscribe(canCreateLayer => {
      this.allowCreateLayer = canCreateLayer;
    });
    this.store$.select(selectCreateLayerMode).pipe(takeUntil(this.destroyed)).subscribe(createLayerMode => {
      this.createLayerMode = createLayerMode;
    });
    this.errorMessage$ = this.store$.select(selectCreateLayerErrorMessage);
    this.selectingDataSource$ = this.store$.select(selectIsSelectingDataSource);
    this.hasActiveSidePanel$ = combineLatest([ this.selectingDataSource$, this.store$.select(selectIsCreatingCriteria) ])
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

  public canCreateLayer() {
    return this.allowCreateLayer;
  }

  public showStylingTab() {
    if (!this.canCreateLayer()) {
      return;
    }
    this.next.emit();
  }

  public isCreatingAttributesLayer() {
    return this.createLayerMode === CreateLayerModeEnum.ATTRIBUTES;
  }

  public isCreatingThematicLayer() {
    return this.createLayerMode === CreateLayerModeEnum.THEMATIC;
  }

}
