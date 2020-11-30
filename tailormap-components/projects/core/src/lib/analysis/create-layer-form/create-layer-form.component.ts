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
import { selectCreateLayerData } from '../state/analysis.selectors';
import {
  of,
  Subject,
} from 'rxjs';
import { CreateLayerDataModel } from '../models/create-layer-data.model';
import { TreeModel } from '../../shared/tree/models/tree.model';
import { MetadataService } from '../../application/services/metadata.service';

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
  public createLayerData: CreateLayerDataModel;
  public selectingDataSource: boolean;

  constructor(
    private store$: Store<AnalysisState>,
    private overlay: OverlayService,
    private metadataService: MetadataService,
  ) {}

  public ngOnInit() {
    this.store$.select(selectCreateLayerData)
      .pipe(takeUntil(this.destroyed))
      .subscribe(createLayerData => {
        this.createLayerData = createLayerData;
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
            selectedLayer: this.createLayerData.selectedDataSource,
          }).afterClosed$;
        }),
        tap(() => this.selectingDataSource = false),
        filter(result => !!result.data.selectedLayer),
      )
      .subscribe(result => {
        this.store$.dispatch(setSelectedDataSource({ layer: result.data.selectedLayer }));
      });
  }

}
