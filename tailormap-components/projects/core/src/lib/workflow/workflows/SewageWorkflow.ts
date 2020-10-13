import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import { Feature } from '../../shared/generated';
import { FormComponent } from '../../feature-form/form/form.component';
import {
  MapClickedEvent,
} from '../../shared/models/event-models';
import { VectorLayer } from '../../../../../bridge/typings';
import { GeoJSONPoint } from 'wellknown';
import { DialogData } from '../../feature-form/form/form-models';
import { ChooseTypesComponent } from '../../user-interface/sewage/choose-types/choose-types.component';

export class SewageWorkflow extends Workflow {
  private currentStep: Step;
  private well1: [number, number] | [number, number, number];
  private well2: [number, number] | [number, number, number];
  private featureType: string;

  private choice: Choice;

  constructor() {
    super();
    this.currentStep = Step.START;
    this.closeAfterSave = true;
  }


  public addFeature(featureType: string) {
    if (this.currentStep === Step.START) {
      this.makeChoices();
    }
    if (this.currentStep === Step.WELL1 || this.currentStep === Step.WELL2) {
      if (this.currentStep === Step.WELL1) {
        this.featureType = this.choice.well1;
      } else {
        this.featureType = this.choice.well2;
      }
      this.vectorLayer.drawFeature('Point');
    }
    if (this.currentStep === Step.DUCT) {
      const linedstring = 'LINESTRING(' + this.well1[0] + ' ' + this.well1[1] + ', '
        + this.well2[0] + ' ' + this.well2[1] + ')';

      this.featureType = this.choice.duct;
      this.geometryDrawn(this.vectorLayer, {
        config: {
          wktgeom: linedstring,
        },
      });
    }
  }

  public geometryDrawn(vectorLayer: VectorLayer, feature: any) {
    const geom = feature.config.wktgeom;
    const geoJson = wellknown.parse(geom);
    if (this.currentStep === Step.WELL1) {
      this.well1 = (geoJson as GeoJSONPoint).coordinates;
    }
    if (this.currentStep === Step.WELL2) {
      this.well2 = (geoJson as GeoJSONPoint).coordinates;
    }
    const objecttype = this.featureType.charAt(0).toUpperCase() + this.featureType.slice(1);
    const feat = this.featureInitializerService.create(objecttype,
      {geometrie: geoJson, clazz: this.featureType, children: []});

    const features: Feature[] = [feat];
    this.openDialog(features);
  }

  private makeChoices() {

    const dialogRef = this.dialog.open(ChooseTypesComponent, {
      width: '350px',
      height: '400px',
      disableClose: true,
    });
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    dialogRef.afterClosed().subscribe(result => {
      const choice = (result as Choice);
      if (choice.cancelled) {
        this.endWorkflow();
      } else {
        this.choice = choice;
        this.currentStep = Step.WELL1;
        this.addFeature(null);
      }
    });
  }

  public openDialog(formFeatures ?: Feature[]): void {
    const dialogData: DialogData = {
      formFeatures,
      isBulk: false,
      closeAfterSave: true,
    };
    const dialogRef = this.dialog.open(FormComponent, {
      width: '1050px',
      height: '800px',
      disableClose: true,
      data: dialogData,
    });
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    dialogRef.afterClosed().subscribe(result => {
      this.afterEditting();
    });
  }

  public mapClick(data: MapClickedEvent): void {
  }


  public afterEditting(): void {
    switch (this.currentStep) {
      case Step.WELL1:

        this.currentStep = Step.WELL2;
        this.addFeature('');
        break;
      case Step.WELL2:
        this.currentStep = Step.DUCT;
        this.addFeature('');
        break;
      case Step.DUCT:
        this.vectorLayer.removeAllFeatures();
        this.highlightLayer.removeAllFeatures();
        break;
    }
    this.tailorMap.getViewerController().mapComponent.getMap().update();
  }

}

enum Step {
  START = 'start',
  WELL1 = 'well1',
  WELL2 = 'well2',
  DUCT = 'duct',
}

export interface Choice {
  well1?: string;
  well2?: string;
  duct?: string;
  cancelled: boolean;
};
