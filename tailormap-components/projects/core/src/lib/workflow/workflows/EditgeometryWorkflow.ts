import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import {
  Feature,
  Geometry,
} from '../../shared/generated';
import { MapClickedEvent } from '../../shared/models/event-models';
import { VectorLayer } from '../../../../../bridge/typings';
import { takeUntil } from 'rxjs/operators';
import { WorkflowHelpers } from './Workflow.helpers';
import { FormComponent } from '../../feature-form/form/form.component';
import { DialogData } from '../../feature-form/form/form-models';
import { Coordinate } from '../../user-interface/models';
export class EditgeometryWorkflow extends Workflow {

  private featureType: string;

  constructor() {
    super();
  }

  public afterInit() {
    super.afterInit();
    this.dialog.getDialogById(this.FORMCOMPONENT_DIALOG_ID).afterClosed().subscribe(value => {
      this.drawGeom();
    });
  }

  public drawGeom() : void{
    const feat = this.event.feature
    const geom = this.featureInitializerService.retrieveGeometry(feat);
    if (geom) {
      this.vectorLayer.readGeoJSON(geom);

      const coord : Coordinate= WorkflowHelpers.findTopRight(geom) ;
      const pixel = this.tailorMap.getMapComponent().getMap().coordinateToPixel(coord.x, coord.y);
      this.geometryConfirmService.open({
        left: pixel.x,
        top: pixel.y,
      }).pipe(takeUntil(this.destroyed)).subscribe(accepted => {
        if (accepted) {
          this.openForm(this.vectorLayer.getActiveFeature());
        } else {
          this.vectorLayer.removeAllFeatures();
          this.endWorkflow();
        }
        this.geometryConfirmService.hide();
      });
    }
  }

  private openForm(geom: Geometry){

    const objecttype = this.event.feature.objecttype;
    const feat = this.featureInitializerService.create(objecttype,
      {geometrie: geom, ...this.event.feature });

    const data : DialogData = {
      formFeatures: [feat], isBulk: false,

    };

    const dialogRef = this.dialog.open(FormComponent, {
      id: this.FORMCOMPONENT_DIALOG_ID,
      width: '1050px',
      height: '800px',
      disableClose: true,
      data,
    });
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    dialogRef.afterClosed().subscribe(result => {
      this.afterEditting();
    });

  }

  public afterEditting() {
    const a=0;
  }

  public geometryDrawn(vectorLayer: VectorLayer, feature: any): void {
  }

  public getDestinationFeatures(): Feature[] {
    const a = 0;
    return [];
  }

  public mapClick(data: MapClickedEvent): void {
    const a = 0;
  }

}
