import {Component, OnInit, Input, Output, EventEmitter, Inject} from '@angular/core';
import { WegvakkenFormComponent } from '../wegvakken-form/wegvakken-form.component';
import { MatDialog } from '@angular/material';
import {BASE_PATH, Feature, Wegvakonderdeel, WegvakonderdeelControllerService} from "../../shared/generated";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DialogClosedData} from "./wegvak-popup-models";
import {FormConfiguration, FormConfigurations} from "../wegvakken-form/wegvakken-form-models";


@Component({
  selector: 'flamingo-wegvak-popup',
  templateUrl: './wegvak-popup.component.html',
  styleUrls: ['./wegvak-popup.component.css'],
})
export class WegvakPopupComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private service: WegvakonderdeelControllerService,
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
      (wegvakonderdelen: Wegvakonderdeel[]) => {

        this.openDialog(wegvakonderdelen);
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

  public ngOnInit() {
  }

  public openDialog(formFeatures ?: Feature[]): void {
    this.popupOpen = true;

    const dialogRef = this.dialog.open(WegvakkenFormComponent, {
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

/*
  private convertToFormFeature(f: any, isRelated: boolean): Wegvakonderdeel[] {
    if (Array.isArray(f)) {
      const features = [];
      f.forEach(feat => {
        const featureObject = this.convertToFormFeature(feat, false);
        if(featureObject){
          features.push(featureObject[0]);
        }
      });
      return features;
    } else {
      const id = f.id;
      const ft = "wegvakonderdeel";
      const formConfig = this.formConfigs.config[ft];
      if(!formConfig){
        return null;
      }
      const featureAttributes: FeatureAttribute[] = this.convertFeatureAttributes(formConfig, f);
      const children: Feature[] = [];
      if (f.children) {
        f.children.forEach((feat) => {
          const featureObject = this.convertToFormFeature(feat, true);
          if(featureObject){
            children.push(featureObject[0]);
          }
        });
      }
      const feature: Feature = {
          id,
          children,
          isRelated,
          attributes: featureAttributes,
      };
      return [feature];
    }
  }*/

/*  private convertFeatureAttributes(formConfig: FormConfiguration, attributes: []): FeatureAttribute[] {
    const attrs = [];
    for (const attr of formConfig.fields) {
      for (const key in attributes) {
        if (this.lookup[attr.key] === key) {
          const attribute = {...attr, value : attributes[key]};
          attrs.push(attribute);
          break;
        }
      }
    }
    return attrs;
  }
*/
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
