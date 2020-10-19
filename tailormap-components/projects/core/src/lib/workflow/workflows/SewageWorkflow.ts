import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import {
  Boom,
  Boominspectie,
  Boomplanning,
  CultBeplanting,
  Feature,
  Gras,
  Haag,
  MechLeiding,
  NatBeplanting,
  Rioolput,
  VrijvLeiding,
  Weginspectie,
  Wegvakonderdeel,
  Wegvakonderdeelplanning,
} from '../../shared/generated';
import { FormComponent } from '../../feature-form/form/form.component';
import {
  MapClickedEvent,
} from '../../shared/models/event-models';
import { VectorLayer } from '../../../../../bridge/typings';
import { GeoJSONPoint } from 'wellknown';
import { DialogData } from '../../feature-form/form/form-models';
import { ChooseTypesComponent } from '../../user-interface/sewage/choose-types/choose-types.component';
import { Observable } from 'rxjs';
import {
  take,
} from 'rxjs/operators';

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

    if (this.currentStep === Step.WELL1 || this.currentStep === Step.WELL2) {
      const coords = (geoJson as GeoJSONPoint).coordinates;
      if (this.currentStep === Step.WELL1) {
        this.well1 = coords
      }
      if (this.currentStep === Step.WELL2) {
        this.well2 = coords
      }
      this.retrieveFeatures$(coords).subscribe(features => {
        let feat = null;
        if (features.length > 0) {
          const message = 'Wilt u de bestaande ' + this.featureType + ' met naam \"' + this.formConfigRepo.getFeatureLabel(features[0]) +
            '\" gebruiken?';

          feat = features[0];
          this.confirmService.confirm$('Bestaande feature gebruiken?',
            message, false)
            .pipe(take(1)).subscribe(useExisting => {
            if (!useExisting) {
              feat = this.createFeature(geoJson);
            }
            this.openDialog(feat);
          });
        } else {
          feat = this.createFeature(geoJson);
          this.openDialog(feat);
        }
      });
    } else {
      const feat = this.createFeature(geoJson);
      this.openDialog(feat);
    }
  }

  private createFeature(geoJson: wellknown.GeoJSONGeometry): Feature {
    const objecttype = this.featureType.charAt(0).toUpperCase() + this.featureType.slice(1);
    const feat = this.featureInitializerService.create(objecttype,
      {geometrie: geoJson, clazz: this.featureType, children: []});
    return feat;
  }

  private makeChoices() {
    const dialogRef = this.dialog.open(ChooseTypesComponent, {
      width: '240px',
      height: '370px',
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

  public openDialog(feature ?: Feature): void {
    const dialogData: DialogData = {
      formFeatures: [feature],
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

  private retrieveFeatures$(coords: [number, number] | [number, number, number]):
    Observable<Array<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag
      | MechLeiding | NatBeplanting | Rioolput | VrijvLeiding | Weginspectie | Wegvakonderdeel
      | Wegvakonderdeelplanning>> {
    const x = coords[0];
    const y = coords[1];

    const scale = this.tailorMap.getMapComponent().getMap().getResolution() * 4;
    const featureTypes: string[] = [this.featureType];
    return this.service.featuretypeOnPoint({featureTypes, x, y, scale});
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
        this.endWorkflow();
        break;
    }
    this.tailorMap.getViewerController().mapComponent.getMap().update();
  }

  public setCopyMode(feature: Feature): void {
  }

  public setFeature(feature: Feature): void {
  }

  getDestinationFeatures(): Feature[] {
    return [];
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
