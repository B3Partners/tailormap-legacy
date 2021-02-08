import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LayerUtils } from '../../../shared/layer-utils/layer-utils.service';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { FormconfigRepositoryService } from '../../../shared/formconfig-repository/formconfig-repository.service';
import { MatSelectChange } from '@angular/material/select';
import { FormConfiguration } from '../../../feature-form/form/form-models';
import { Store } from '@ngrx/store';
import { FormState } from '../../../feature-form/state/form.state';
import { selectFormConfigForFeatureType, selectFormConfigs, selectFormFeaturetypes } from '../../../feature-form/state/form.selectors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { WORKFLOW_ACTION } from '../../../workflow/state/workflow-models';
import { WorkflowState } from '../../../workflow/state/workflow.state';
import * as WorkflowActions from '../../../workflow/state/workflow.actions';

@Component({
  selector: 'tailormap-add-feature-menu',
  templateUrl: './add-feature-menu.component.html',
  styleUrls: ['./add-feature-menu.component.css'],
})
export class AddFeatureMenuComponent implements OnInit, OnDestroy {

  public layer = '-1';
  public layers: string[];

  private selectedConfig: FormConfiguration;
  private destroyed = new Subject();

  constructor(
    public dialogRef: MatDialogRef<AddFeatureMenuComponent>,
    public tailorMapService: TailorMapService,
    private ngZone: NgZone,
    private store$: Store<FormState | WorkflowState>,
    public formConfigRepo: FormconfigRepositoryService,
  ) {
    this.tailorMapService.layerVisibilityChanged$.subscribe(value => {
      this.ngZone.run(() => {
        this.calculateVisibleLayers();
      });
    });
    this.init();
  }

  public init(): void {
    this.store$.select(selectFormConfigs)
      .pipe(takeUntil(this.destroyed))
      .subscribe(formConfigs => {
        this.calculateVisibleLayers();
      });
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public layerSelected(event: MatSelectChange): void {
    const layer: string = event.value;
    this.store$.select(selectFormConfigForFeatureType, layer)
      .pipe(takeUntil(this.destroyed))
      .subscribe(formConfig => this.selectedConfig = formConfig);
  }

  public calculateVisibleLayers(): void {
    this.layers = [];

    this.store$.select(selectFormFeaturetypes)
      .pipe(takeUntil(this.destroyed))
      .subscribe(featureTypes => {

        const appLayers = this.tailorMapService.getViewerController().getVisibleLayers() as number[];
        appLayers.forEach(appLayerId => {
          const appLayer = this.tailorMapService.getViewerController().getAppLayerById(appLayerId);
          let layerName: string = appLayer.layerName;
          layerName = LayerUtils.sanitizeLayername(layerName);

          if (featureTypes.findIndex(l => l.toLowerCase() === layerName) !== -1) {
            this.layers.push(layerName);
          }
        });
      });
  }

  public ngOnInit(): void {
  }

  public close(): void {
    this.dialogRef.close();
  }

  public draw(type: string): void {
    this.store$.dispatch(WorkflowActions.setTypes({
      action:WORKFLOW_ACTION.ADD_FEATURE,
      geometryType: type,
      featureType: this.layer,
    }));
    this.dialogRef.close();
  }

  public isPolygon(): boolean {
    const geomtype = this.selectedConfig?.featuretypeMetadata.geometryType;
    return geomtype === 'GEOMETRY' || geomtype === 'POLYGON';
  }

  public isLineString(): boolean {
    const geomtype = this.selectedConfig?.featuretypeMetadata.geometryType;
    return geomtype === 'GEOMETRY' || geomtype === 'LINESTRING';
  }

  public isPoint(): boolean {
    const geomtype = this.selectedConfig?.featuretypeMetadata.geometryType;
    return geomtype === 'GEOMETRY' || geomtype === 'POINT';
  }
}
