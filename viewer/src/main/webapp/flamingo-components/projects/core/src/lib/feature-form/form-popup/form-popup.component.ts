import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormComponent} from '../form/form.component';
import { MatDialog } from '@angular/material/dialog';
import {Feature, FeatureControllerService,} from "../../shared/generated";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DialogClosedData, GeometryInteractionData, GeometryType} from "./form-popup-models";
import {FormConfigurations} from "../form/form-models";
import {AddButtonEvent} from "../../user-interface/add-feature/add-feature-models";
import * as wellknown from "wellknown";
import {FeatureInitializerService} from "../../shared/feature-initializer/feature-initializer.service";
import {LayerVisibilityEvent} from "../../shared/layer-visibility-service/layer-visibility-models";
import {LayerVisibilityServiceService} from "../../shared/layer-visibility-service/layer-visibility-service.service";
import {FormconfigRepositoryService} from "../../shared/formconfig-repository/formconfig-repository.service";

@Component({
  selector: 'flamingo-form-popup',
  templateUrl: './form-popup.component.html',
  styleUrls: ['./form-popup.component.css'],
})
export class FormPopupComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private service: FeatureControllerService,
    private _snackBar: MatSnackBar,
    private featureInitializerService: FeatureInitializerService,
    private formConfigRepo: FormconfigRepositoryService,
    private visibilityService: LayerVisibilityServiceService) {
  }

  private popupOpen = false;

  private layers;

  private isBulk: string;


  public lookup: Map<string, string>;

  @Input()
  public set bulk(isBulk: string) {
    this.isBulk = isBulk;
  }

  @Input()
  public set visibleLayers(layers: string){
    this.layers = JSON.parse(layers);
  }


  @Input()
  public set mapClicked(data: string){
    const mapClickData = JSON.parse(data);
    const x = mapClickData.x;
    const y = mapClickData.y;
    const scale = mapClickData.scale;
    this.service.onPoint(x, y, scale).subscribe(
      (features: Feature[]) => {
        if(features && features.length >0){
          this.openDialog(features);
        }
      },
      error => {
        this._snackBar.open('Fout: Feature niet kunnen ophalen: ' + error, '', {
          duration: 5000,
        });
      },
    );
  }

  @Input()
  public set openPopup(open: string) {
    if (open === 'true') {
      this.openDialog();
    }
  }

  @Output()
  public wanneerPopupClosed = new EventEmitter<DialogClosedData>();

  @Output()
  public startGeometryDrawing = new EventEmitter<GeometryInteractionData>();

  public ngOnInit() {
  }

  public openDialog(formFeatures ?: Feature[]): void {
    this.popupOpen = true;

    const dialogRef = this.dialog.open(FormComponent, {
      width: '1050px',
      height: '800px',
      disableClose: true,
      data: {
        formFeatures,
        isBulk: this.isBulk,
        lookup: this.lookup,
      },
    });
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    dialogRef.afterClosed().subscribe(result => {
      this.popupOpen = false;
      this.wanneerPopupClosed.emit({
        iets: 'hoi',
      });
    });
  }

  public temp: AddButtonEvent;
  public addFeature(event: AddButtonEvent){
    this.temp = event;
    this.startGeometryDrawing.emit({
      type: GeometryType.POLYGON
    });
  }

  @Input()
  public set layerVisibilityChanged(evtString: any) {
    let event: LayerVisibilityEvent = JSON.parse(evtString);
    this.visibilityService.layerVisibiltyChanged(event);
  }


  @Input()
  public set geometryDrawn(geom:string){
    const geoJson = wellknown.parse(geom);
    const objecttype = this.temp.featuretype.charAt(0).toUpperCase() + this.temp.featuretype.slice(1);
    let feat = this.featureInitializerService.create(objecttype,{geometrie:geoJson, clazz: this.temp.featuretype, children:[]});

    const features :Feature[] =[feat];
    this.openDialog(features);
  }

  public createColumnLookup(): Map<string, string> {
    const lookup = new Map<string, string>();
   /* this.flamingoAppLayer.attributes.forEach(a => {
      const index = a.longname.indexOf('.');
      const featureType = a.longname.substring(0, index);
      const originalName = a.longname.substring(index + 1);
      const alias = a.editAlias || a.alias;
      lookup[originalName] = (alias || a.name);
    });*/
    return lookup;
  }

}
