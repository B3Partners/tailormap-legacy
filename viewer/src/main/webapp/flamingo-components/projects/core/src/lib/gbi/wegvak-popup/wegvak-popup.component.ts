import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WegvakkenFormComponent } from '../wegvakken-form/wegvakken-form.component';
import { MatDialog } from '@angular/material';
import { Feature, DialogClosedData, FormConfigurations,
        FeatureAttribute, FormConfiguration } from '../../shared/wegvakken-models';

@Component({
  selector: 'flamingo-wegvak-popup',
  templateUrl: './wegvak-popup.component.html',
  styleUrls: ['./wegvak-popup.component.css'],
})
export class WegvakPopupComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  private popupOpen = false;

  private applicationId: string;

  private formConfigs: FormConfigurations;

  @Input()
  public set application(id: string) {
    this.applicationId = id;
  }

  @Input()
  public set config(config: string) {
    this.formConfigs = this.convertToFomConfig(config);
  }

  @Input()
  public set featureClicked(data: string) {
    const ff = this.convertToFormFeature(JSON.parse(data), false);
    this.openDialog(ff);
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

  public openDialog(formFeature ?: Feature): void {
    this.popupOpen = true;

    const dialogRef = this.dialog.open(WegvakkenFormComponent, {
      width: '1050px',
      height: '800px',
      data: {
        formConfigs: this.formConfigs,
        formFeature,
        applicationId: this.applicationId,
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

  private convertToFormFeature(f: any, isRelated: boolean): Feature {
    const id = f.id;
    const ft = id.substring(0, id.indexOf('.') );
    const formConfig = this.formConfigs.config[ft];
    const featureAttributes: FeatureAttribute[] = this.convertFeatureAttributes(formConfig, f.attributes);
    const children: Feature[] = [];
    if (f.children) {
      f.children.forEach((f) => {
        children.push(this.convertToFormFeature(f, true));
      });
    }
    const feature: Feature = {
        id,
        featureType: ft,
        featureSource: '16',
        children,
        appLayer: f.appLayer,
        isRelated,
        attributes: featureAttributes,
    };
    return feature;
  }

  private convertFeatureAttributes(formConfig: FormConfiguration, attributes: []): FeatureAttribute[] {
    const attrs = [];
    for (const attr of formConfig.fields) {
      for (const key in attributes) {
        if (attr.key === key) {
          const attribute = {...attr, value : attributes[key]};
          attrs.push(attribute);
          break;
        }
      }
    }
    return attrs;
  }

  private convertToFomConfig(config: string): FormConfigurations {
    return JSON.parse(config);
  }

}
