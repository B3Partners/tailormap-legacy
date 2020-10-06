import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { MatDialog } from '@angular/material/dialog';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import { FeatureControllerService } from '../../shared/generated';
import { VectorLayer } from '../../../../../bridge/typings';
import { MapClickedEvent } from '../../shared/models/event-models';

export abstract class Workflow {

  public id = 0;
  public vectorLayer: VectorLayer;
  public highlightLayer: VectorLayer;
  protected tailorMap: TailorMapService;
  protected dialog: MatDialog;
  protected featureInitializerService: FeatureInitializerService;
  protected snackBar: MatSnackBar;
  protected formConfigRepo: FormconfigRepositoryService;
  protected service: FeatureControllerService;

  public init(
    tailorMap: TailorMapService,
    dialog: MatDialog,
    featureInitializerService: FeatureInitializerService,
    formConfigRepo: FormconfigRepositoryService,
    snackBar: MatSnackBar,
    service: FeatureControllerService): void {

    this.tailorMap = tailorMap;
    this.dialog = dialog;
    this.featureInitializerService = featureInitializerService;
    this.formConfigRepo = formConfigRepo;
    this.snackBar = snackBar;
    this.service = service;
    this.vectorLayer.addListener('ON_FEATURE_ADDED', this.geometryDrawn, this);
  }

  public destroy(): void {
    this.vectorLayer.removeListener('ON_FEATURE_ADDED', this.geometryDrawn, this);
  }

  public abstract geometryDrawn(vectorLayer: VectorLayer, feature: any): void;

  public abstract addFeature(featureType: string): void;

  public abstract mapClick(data: MapClickedEvent): void;

  public abstract afterEditting(): void;
}
