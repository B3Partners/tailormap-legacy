import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { MatDialog } from '@angular/material/dialog';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Feature, FeatureControllerService } from '../../shared/generated';
import { VectorLayer } from '../../../../../bridge/typings';
import { MapClickedEvent } from '../../shared/models/event-models';
import { NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfirmDialogService } from '@tailormap/shared';
import { GeometryConfirmService } from '../../user-interface/geometry-confirm-buttons/geometry-confirm.service';
import { LayerUtils } from '../../shared/layer-utils/layer-utils.service';
import { FormState } from '../../feature-form/state/form.state';
import { Store } from '@ngrx/store';
import { WorkflowState } from '../state/workflow.state';
import { FeatureSelectionService } from '../../shared/feature-selection/feature-selection.service';

export abstract class Workflow {

  protected destroyed;
  public id = 0;
  public vectorLayer: VectorLayer;
  public highlightLayer: VectorLayer;
  public destinationFeatures;
  protected tailorMap: TailorMapService;
  protected dialog: MatDialog;
  protected featureInitializerService: FeatureInitializerService;
  protected snackBar: MatSnackBar;
  protected service: FeatureControllerService;
  protected confirmService: ConfirmDialogService;
  protected ngZone: NgZone;
  public closeAfterSave: boolean;
  protected geometryConfirmService: GeometryConfirmService;
  protected layerUtils: LayerUtils;
  protected store$: Store<FormState | WorkflowState>;
  protected featureSelectionService: FeatureSelectionService;

  public close$ = new Subject<boolean>();

  public init(
    tailorMap: TailorMapService,
    dialog: MatDialog,
    featureInitializerService: FeatureInitializerService,
    snackBar: MatSnackBar,
    service: FeatureControllerService,
    ngZone: NgZone,
    confirmService: ConfirmDialogService,
    geometryConfirmService: GeometryConfirmService,
    layerUtils: LayerUtils,
    store$: Store<FormState>,
    featureSelectionService: FeatureSelectionService,
  ): void {

    this.tailorMap = tailorMap;
    this.dialog = dialog;
    this.featureInitializerService = featureInitializerService;
    this.snackBar = snackBar;
    this.service = service;
    this.ngZone = ngZone;
    this.destinationFeatures = [];
    this.confirmService = confirmService;
    this.geometryConfirmService = geometryConfirmService;
    this.layerUtils = layerUtils;
    this.store$ = store$;
    this.featureSelectionService = featureSelectionService;
    this.destroyed = new Subject();
    this.afterInit();
  }

  public afterInit(): void {

  }

  public destroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public abstract geometryDrawn(vectorLayer: VectorLayer, feature: any): void;

  public abstract getDestinationFeatures(): Feature [];

  public abstract mapClick(data: MapClickedEvent): void;

  public abstract afterEditing(): void;

  public endWorkflow(): void {
    this.close$.next(true);
  }

  public zoomToFeature(feature: Feature) {
    const geom = this.featureInitializerService.retrieveGeometry(feature);
    if (geom) {
      this.highlightLayer.removeAllFeatures();
      this.highlightLayer.readGeoJSON(geom);
    }
  }

}
