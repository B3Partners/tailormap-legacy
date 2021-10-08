/* eslint @typescript-eslint/naming-convention: [ "error", { "selector": ["objectLiteralProperty","classProperty"], "format": ["camelCase", "UPPER_CASE", "snake_case"] } ] */

import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import { GeoJSONPoint } from 'wellknown';
import { Feature } from '../../shared/generated';
import { VectorLayer } from '../../../../../bridge/typings';
import { ChooseTypesComponent } from '../../user-interface/sewage/choose-types/choose-types.component';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { Choice } from './WorkflowModels';
import { setOpenFeatureForm } from '../../feature-form/state/form.actions';
import { selectCurrentFeature, selectFeatureLabel } from '../../feature-form/state/form.selectors';
import { selectFormClosed } from '../../feature-form/state/form.state-helpers';
import { selectFeatureType } from '../state/workflow.selectors';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';

export class SewageWorkflow extends Workflow {
  private currentStep: Step;
  private well1: [number, number] | [number, number, number];
  private well2: [number, number] | [number, number, number];

  private well1Feature: Feature;
  private well2Feature: Feature;
  private featureType: string;

  private choice: Choice;

  constructor() {
    super();
    this.currentStep = Step.START;
    this.closeAfterSave = true;
  }

  public afterInit() {
    super.afterInit();
    if (this.currentStep === Step.START) {
      this.store$.select(selectFeatureType).pipe(takeUntil(this.destroyed)).subscribe(featureType => {
        this.makeChoices(featureType);
      });
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
        this.well1 = coords;
      }
      if (this.currentStep === Step.WELL2) {
        this.well2 = coords;
      }
      this.retrieveFeatures$(coords)
        .pipe(takeUntil(this.destroyed))
        .subscribe(features => {
          let feat: Feature = null;
          if (features.length > 0) {
            feat = features[0];
            this.store$.select(selectFeatureLabel, feat).pipe(takeUntil(this.destroyed)).subscribe(label => {
              const message = 'Wilt u de bestaande ' + this.featureType + ' met naam \"' + label + '\" gebruiken?';
              this.confirmService.confirm$('Bestaande feature gebruiken?',
                message, false)
                .pipe(take(1)).subscribe(useExisting => {
                if (!useExisting) {
                  this.createFeature$(geom, this.getExtraParams()).subscribe(f=>{
                    this.openDialog(f);
                  });
                }
                this.openDialog(feat);
              });
            });
          } else {
            this.createFeature$(geom, this.getExtraParams()).subscribe(f=>{
              this.openDialog(f);
            });
          }
        });
    } else {
      this.createFeature$(geom, this.getExtraParams()).subscribe(feat=>{
        this.openDialog(feat);
      });
    }
  }

  private getExtraParams() {

    if (this.currentStep === Step.DUCT) {
      switch (this.choice.duct) {
        case 'mechleiding':
          return {
            pompput_id: this.well1Feature.fid,
            lozingsput_id: this.well2Feature.fid,
          };
        case 'vrijvleiding':
          return {
            beginput_id: this.well1Feature.fid,
            eindput_id: this.well2Feature.fid,
          };
      }
    } else {
      return {};
    }
  }

  private createFeature$(geoJson: string, params: any): Observable<Feature> {
    const objecttype = this.featureType.charAt(0).toUpperCase() + this.featureType.slice(1);
    return this.featureInitializerService.create$(objecttype,
      { ...params }, geoJson);
  }

  private makeChoices(featureType: string) {
    const dialogRef = this.dialog.open(ChooseTypesComponent, {
      width: '240px',
      height: '400px',
      disableClose: true,
      data: {
        featureType,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      const choice = (result as Choice);
      if (choice.cancelled) {
        this.endWorkflow();
      } else {
        this.choice = choice;
        this.currentStep = Step.WELL1;
        this.afterInit();
      }
    });
  }

  public openDialog(feature?: Feature): void {
    this.store$.dispatch(setOpenFeatureForm({features: [feature], closeAfterSave: true, editMode: true, multiFormWorkflow: true}));

    this.store$.select(selectCurrentFeature)
      .pipe(
        filter(currentFeature => currentFeature && currentFeature.fid !== FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT),
        take(1),
        switchMap(currentFeature => {
          return this.store$.pipe(selectFormClosed,
            take(1),
            map(() => currentFeature));
        }),
      ).subscribe(currentFeature => {this.afterEditing(currentFeature);});
  }

  public mapClick(): void {

  }

  private retrieveFeatures$(coords: [number, number] | [number, number, number]):
    Observable<Array<Feature>> {
    const x = coords[0];
    const y = coords[1];

    const scale = this.tailorMap.getMapComponent().getMap().getResolution() * 4;
    const featureTypes: string[] = [this.featureType];
    return this.service.featuretypeOnPoint({application: this.tailorMap.getApplicationId(), featureTypes, x, y, scale});
  }


  public afterEditing(result?: any): void {
    switch (this.currentStep) {
      case Step.WELL1:
        this.well1Feature = result;
        this.currentStep = Step.WELL2;
        this.afterInit();
        break;
      case Step.WELL2:
        this.well2Feature = result;
        this.currentStep = Step.DUCT;
        this.afterInit();
        break;
      case Step.DUCT:
        this.vectorLayer.removeAllFeatures();
        this.highlightLayer.removeAllFeatures();
        this.endWorkflow();
        break;
    }
    this.tailorMap.getViewerController().mapComponent.getMap().update();
  }

  public getDestinationFeatures(): Feature[] {
    return [];
  }

}

enum Step {
  START = 'start',
  WELL1 = 'well1',
  WELL2 = 'well2',
  DUCT = 'duct',
}
