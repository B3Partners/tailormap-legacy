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
  setSelectedDataSource,
} from '../state/analysis.actions';
import { OverlayService } from '../../shared/overlay-service/overlay.service';
import {
  selectApplicationTreeWithoutBackgroundLayers,
} from '../../application/state/application.selectors';
import {
  concatMap,
  filter,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { CreateLayerLayerSelectionComponent } from '../create-layer-layer-selection/create-layer-layer-selection.component';
import { Subject } from 'rxjs';
import { selectSelectedDataSource } from '../state/analysis.selectors';
import { CriteriaSourceModel } from '../models/criteria-source.model';
import { SimpleCriteriaComponent } from '../criteria/simple-criteria/simple-criteria.component';

@Component({
  selector: 'tailormap-create-layer-form',
  templateUrl: './create-layer-form.component.html',
  styleUrls: ['./create-layer-form.component.css'],
})
export class CreateLayerFormComponent implements OnInit, OnDestroy {

  @Output()
  public next = new EventEmitter();

  private destroyed = new Subject();
  public selectingDataSource: boolean;

  public layerName = new FormControl('');
  public selectedDataSource: CriteriaSourceModel;

  public creatingCriteria: boolean;

  constructor(
    private store$: Store<AnalysisState>,
    private overlay: OverlayService,
  ) {
  }

  public ngOnInit() {
    this.store$.select(selectSelectedDataSource)
      .pipe(takeUntil(this.destroyed))
      .subscribe(selectedDataSource => {
        this.selectedDataSource = selectedDataSource
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
    this.store$.select(selectApplicationTreeWithoutBackgroundLayers)
      .pipe(
        take(1),
        tap(() => this.selectingDataSource = true),
        concatMap(tree => {
          return CreateLayerLayerSelectionComponent.open(this.overlay, {
            tree,
            title: 'Selectiebron',
            selectedLayer: this.selectedDataSource,
          }).afterClosed$;
        }),
        tap(() => this.selectingDataSource = false),
        filter(result => !!result.data.selectedLayer),
      )
      .subscribe(result => {
        const source: CriteriaSourceModel = {
          layerId: +(result.data.selectedLayer.id),
          featureType: result.data.selectedLayer.featureType,
          label: result.data.selectedLayer.alias,
        }
        this.store$.dispatch(setSelectedDataSource({ source }));
      });
  }

  public setCriteria() {
    this.creatingCriteria = true;
    SimpleCriteriaComponent.open(this.overlay).afterClosed$
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        this.creatingCriteria = false;
      });
  }

}
