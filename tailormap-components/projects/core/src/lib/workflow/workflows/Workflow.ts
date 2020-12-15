import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { MatDialog } from '@angular/material/dialog';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import {
  Feature,
  FeatureControllerService,
} from '../../shared/generated';
import { VectorLayer } from '../../../../../bridge/typings';
import { MapClickedEvent } from '../../shared/models/event-models';
import { NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { GeometryConfirmService } from '../../user-interface/edit-bar/geometry-confirm-buttons/geometry-confirm.service';

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
  protected formConfigRepo: FormconfigRepositoryService;
  protected service: FeatureControllerService;
  protected confirmService: ConfirmDialogService;
  protected ngZone: NgZone;
  public closeAfterSave: boolean;
  protected geometryConfirmService: GeometryConfirmService;

  public close$ = new Subject<boolean>();

  public init(
    tailorMap: TailorMapService,
    dialog: MatDialog,
    featureInitializerService: FeatureInitializerService,
    formConfigRepo: FormconfigRepositoryService,
    snackBar: MatSnackBar,
    service: FeatureControllerService,
    ngZone: NgZone,
    confirmService: ConfirmDialogService,
    geometryConfirmService: GeometryConfirmService): void {

    this.tailorMap = tailorMap;
    this.dialog = dialog;
    this.featureInitializerService = featureInitializerService;
    this.formConfigRepo = formConfigRepo;
    this.snackBar = snackBar;
    this.service = service;
    this.ngZone = ngZone;
    this.destinationFeatures = [];
    this.confirmService = confirmService;
    this.geometryConfirmService = geometryConfirmService;
    this.destroyed = new Subject();
  }

  public destroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public abstract geometryDrawn(vectorLayer: VectorLayer, feature: any): void;

  public abstract setFeature(feature: Feature): void;

  public abstract addFeature(featureType: string, geometryType ?: string): void;

  public abstract getDestinationFeatures(): Feature [];

  public abstract mapClick(data: MapClickedEvent): void;

  public abstract afterEditting(): void;

  public endWorkflow(): void {
    this.close$.next(true);
  }
}
