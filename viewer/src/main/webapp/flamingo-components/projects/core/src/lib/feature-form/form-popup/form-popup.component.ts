import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormComponent} from '../form/form.component';
import {MatDialog} from '@angular/material';
import {Feature, FeatureControllerService,} from "../../shared/generated";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DialogClosedData, GeometryInteractionData, GeometryType} from "./form-popup-models";
import {FormConfigurations} from "../form/form-models";
import {AddButtonEvent} from "../../user-interface/add-feature/add-feature-models";
import * as piet from "wellknown";

@Component({
  selector: 'flamingo-form-popup',
  templateUrl: './form-popup.component.html',
  styleUrls: ['./form-popup.component.css'],
})
export class FormPopupComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private service: FeatureControllerService,
    private _snackBar: MatSnackBar ) {
  }

  private popupOpen = false;

  private layers;

  private isBulk: string;

  private formConfigs: FormConfigurations;

  public lookup: Map<string, string>;

  @Input()
  public set config(config: string) {
    this.formConfigs = JSON.parse(config);
  }

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
        formConfigs: this.formConfigs,
        formFeatures,
        isBulk: this.isBulk,
        lookup: this.lookup,
      },
    });
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    dialogRef.afterClosed().subscribe(result => {
      this.popupOpen = false;
      console.log('The dialog was closed');
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
  public set geometryDrawn(geom:string){
    console.log('geom received', geom);
    const geoJson = piet.parse(geom); // wellknown.parse('');
    console.log("parsed: ", geoJson);
    const features :Feature[] =[
      {
        children: [],
        clazz: this.temp.featuretype,
        objecttype: this.temp.featuretype.charAt(0).toUpperCase() + this.temp.featuretype.slice(1),
        geometrie: geoJson
      }

    ];
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
