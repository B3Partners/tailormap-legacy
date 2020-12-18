import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import {
  Feature,
} from '../../shared/generated';
import { MapClickedEvent } from '../../shared/models/event-models';
import { VectorLayer } from '../../../../../bridge/typings';
import { takeUntil } from 'rxjs/operators';
import { WorkflowHelper } from './workflow.helper';
import { FormComponent } from '../../feature-form/form/form.component';
import { DialogData } from '../../feature-form/form/form-models';
import { Coordinate } from '../../user-interface/models';
import { GeoJSONGeometry } from 'wellknown';
export class EditgeometryWorkflow extends Workflow {

  constructor() {
    super();
  }

  public afterInit() {
    super.afterInit();
    this.dialog.getDialogById(this.FORMCOMPONENT_DIALOG_ID).afterClosed().subscribe(value => {
      this.drawGeom();
    });
  }

  public drawGeom() : void {
    const feat = this.event.feature
    const geom = this.featureInitializerService.retrieveGeometry(feat);
    if (geom) {
      this.vectorLayer.readGeoJSON(geom);

      const coord : Coordinate = WorkflowHelper.findTopRight(geom) ;
      this.geometryConfirmService.open(coord).pipe(takeUntil(this.destroyed)).subscribe(accepted => {
        if (accepted) {
          const wkt = this.vectorLayer.getActiveFeature().config.wktgeom;
          const geoJson = wellknown.parse(wkt);
          this.openForm(geoJson);
        } else {
          this.vectorLayer.removeAllFeatures();
          this.endWorkflow();
        }
        this.geometryConfirmService.hide();
      });
    }
  }

  private openForm(geom: GeoJSONGeometry) {

    const objecttype = this.event.feature.objecttype;
    const feat = this.featureInitializerService.create(objecttype,
      {...this.event.feature, geometrie: geom  });

    const data : DialogData = {
      formFeatures: [feat],
      isBulk: false,
      alreadyDirty: true,
    };

    const dialogRef = this.dialog.open(FormComponent, {
      id: this.FORMCOMPONENT_DIALOG_ID,
      width: '1050px',
      height: '800px',
      disableClose: true,
      data,
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroyed)).subscribe(result => {
      this.afterEditting();
    });

  }

  public afterEditting() {
    this.ngZone.runOutsideAngular(() => {
      this.vectorLayer.removeAllFeatures();
      this.highlightLayer.removeAllFeatures();
      this.tailorMap.getViewerController().mapComponent.getMap().update();
    });
    this.endWorkflow();
  }

  public geometryDrawn(vectorLayer: VectorLayer, feature: any): void {
  }

  public getDestinationFeatures(): Feature[] {
    return [];
  }

  public mapClick(data: MapClickedEvent): void {
  }

}
