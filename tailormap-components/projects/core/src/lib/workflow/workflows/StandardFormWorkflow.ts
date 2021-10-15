import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import { Feature } from '../../shared/generated';
import { MapClickedEvent } from '../../shared/models/event-models';
import { OLFeature, VectorLayer } from '../../../../../bridge/typings';
import { concatMap, filter, take, takeUntil } from 'rxjs/operators';
import { WorkflowHelper } from './workflow.helper';
import * as FormActions from '../../feature-form/state/form.actions';
import { selectFormClosed } from '../../feature-form/state/form.state-helpers';
import { selectFormConfigForFeatureTypeName } from '../../application/state/application.selectors';
import { selectFeatureType, selectGeometryType, selectWorkflowConfig } from '../state/workflow.selectors';
import { combineLatest, of } from 'rxjs';
import { selectCurrentFeature } from '../../feature-form/state/form.selectors';


export class StandardFormWorkflow extends Workflow {

  private featureType: string;
  private isDrawing = false;
  private featureSelectionPopupOpen = false;

  constructor() {
    super();
  }

  public afterInit() {
    super.afterInit();
    combineLatest([
      this.store$.select(selectGeometryType),
      this.store$.select(selectFeatureType),
    ]).pipe(takeUntil(this.destroyed))
      .subscribe(([geometryType, featureType]) => {
        this.featureType = featureType;
        if (geometryType || this.featureType) {
          if (geometryType) {
            this.vectorLayer.drawFeature(this.convertGeomType(geometryType));
          } else {
            this.store$.select(selectFormConfigForFeatureTypeName, this.featureType)
              .pipe(takeUntil(this.destroyed))
              .subscribe(formConfig => {
                const geomtype = formConfig.featuretypeMetadata.geometryType;
                this.vectorLayer.drawFeature(this.convertGeomType(geomtype));
              });
          }
          this.isDrawing = true;
        }
      });

    this.store$.select(selectCurrentFeature)
      .pipe(
        takeUntil(this.destroyed),
        filter(feature => !!feature),
      )
      .subscribe(feature => {
        this.zoomToFeature(feature);
      });
  }

  private convertGeomType(type: string): string {
    switch (type) {
      case 'POLYGON':
        return 'Polygon';
      case 'LINESTRING':
        return 'LineString';
      case 'POINT':
        return 'Point';
      default:
        return 'Geometry';
    }
  }

  public geometryDrawn(vectorLayer: VectorLayer, feature: OLFeature) {
    const geom = feature.config.wktgeom;
    const geoJson = wellknown.parse(geom);

    const coord = WorkflowHelper.findTopRight(geoJson);

    this.geometryConfirmService.open$(coord).pipe(takeUntil(this.destroyed)).subscribe(accepted => {
      if (accepted) {
        const wkt = this.vectorLayer.getActiveFeature().config.wktgeom;

        this.accept(wkt);
      } else {
        vectorLayer.removeAllFeatures();
      }
      this.endWorkflow();
      this.isDrawing = false;
      this.geometryConfirmService.hide();
    });
  }

  private accept(geoJson: string): void {
    this.featureInitializerService.create$(this.featureType, {}, geoJson).subscribe(feat =>{
      const features: Feature[] = [feat];
      this.openDialog(features, true, true);
    });
  }

  public openDialog(formFeatures?: Feature[], editMode: boolean = false, createdFeature?: boolean): void {
    this.store$.dispatch(FormActions.setOpenFeatureForm({features: formFeatures, editMode}));
    this.store$.pipe(selectFormClosed)
      .pipe(take(1))
      .subscribe(() => {
        this.afterEditing(createdFeature);
      });
  }

  public mapClick(data: MapClickedEvent): void {
    if (this.isDrawing) {
      return;
    }
    this.store$.select(selectWorkflowConfig)
      .pipe(
        take(1),
        concatMap(workFlowConfig => this.featureSelectionService.selectFeatureForClick$(data, workFlowConfig.useSelectedLayerFilter)),
        concatMap(feature => combineLatest([
          of(feature),
          feature ? this.store$.select(selectFormConfigForFeatureTypeName, feature.tableName) : of(null),
        ])),
      )
      .subscribe(([ feature, formConfig ]) => {
        this.featureSelectionPopupOpen = false;
        if (!feature || !formConfig) {
          return;
        }
        this.afterEditing();
        this.openDialog([feature]);
      });
  }

  public afterEditing(updateMap?: boolean): void {
    this.ngZone.runOutsideAngular(() => {
      this.vectorLayer.removeAllFeatures();
      this.highlightLayer.removeAllFeatures();
      if (updateMap) {
        this.tailorMap.getViewerController().mapComponent.getMap().update();
      }
    });
  }

  public getDestinationFeatures(): Feature[] {
    return [];
  }

}
