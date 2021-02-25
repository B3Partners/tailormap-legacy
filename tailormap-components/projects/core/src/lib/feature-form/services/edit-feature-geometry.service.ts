import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import {  Observable, of } from 'rxjs';
import { selectCurrentFeature } from '../state/form.selectors';
import { catchError, concatMap, map, take, tap } from 'rxjs/operators';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { WorkflowHelper } from '../../workflow/workflows/workflow.helper';
import { GeometryConfirmService } from '../../user-interface/geometry-confirm-buttons/geometry-confirm.service';
import { VectorLayer } from '../../../../../bridge/typings';
import { GeoJSONGeometry, parse } from 'wellknown';
import { Feature, FeatureControllerService, Geometry } from '../../shared/generated';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class EditFeatureGeometryService {

  private readonly drawingVectorLayer: VectorLayer;

  constructor(
    private store$: Store<FormState>,
    private featureInitializerService: FeatureInitializerService,
    private featureControllerService: FeatureControllerService,
    private geometryConfirmService: GeometryConfirmService,
    private tailorMapService: TailorMapService,
    private snackbar: MatSnackBar,
  ) {
    this.drawingVectorLayer = this.tailorMapService.getViewerController().createVectorLayer('EditFeatureGeometryService');
  }

  public updateCurrentFeatureGeometry$(): Observable<GeoJSONGeometry | Geometry | null> {
    this.clearDrawing();
    return this.store$.select(selectCurrentFeature)
      .pipe(
        take(1),
        concatMap(feature => this.updateGeometry$(feature)),
        concatMap(accepted => {
          if (!accepted) {
            return of(null);
          }
          return this.saveUpdatedGeometry$()
        }),
        tap(() => {
          this.clearDrawing();
        }),
      );
  }

  private updateGeometry$(feature: Feature): Observable<boolean> {
    const geom = this.featureInitializerService.retrieveGeometry(feature);
    if (!geom) {
      return of(null);
    }
    this.drawingVectorLayer.readGeoJSON(geom);
    return this.geometryConfirmService.open$(WorkflowHelper.findTopRight(geom));
  }

  private saveUpdatedGeometry$(): Observable<GeoJSONGeometry | Geometry | null> {
    return this.store$.select(selectCurrentFeature)
      .pipe(
        take(1),
        concatMap(( feature ) => {
          const geomField = this.featureInitializerService.retrieveGeometryField(feature);
          if (!geomField) {
            return of(null);
          }
          const wkt = this.drawingVectorLayer.getActiveFeature().config.wktgeom;
          const updatedGeom = parse(wkt);
          const updatedFeature: Feature = {
            ...feature,
            [geomField]: updatedGeom,
          };
          return this.featureControllerService.update({ objectGuid: updatedFeature.objectGuid, body: updatedFeature })
            .pipe(
              map(() => updatedGeom),
              catchError(() => {
                this.snackbar.open('Opslaan van geometrie is mislukt, probeer opnieuw');
                return of(null);
              }),
            );
        }),
      );
  }

  private clearDrawing() {
    this.geometryConfirmService.hide();
    this.drawingVectorLayer.removeAllFeatures();
    this.tailorMapService.getViewerController().mapComponent.getMap().update();
  }

}
