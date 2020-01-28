import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WegvakkenFormComponent } from '../wegvakken-form/wegvakken-form.component';
import { MatDialog } from '@angular/material';
import { Feature, DialogClosedData, FormConfigurations, IndexedFeatureAttributes,
        FeatureAttribute, FormConfiguration } from '../../shared/wegvakken-models';

@Component({
  selector: 'flamingo-wegvak-popup',
  templateUrl: './wegvak-popup.component.html',
  styleUrls: ['./wegvak-popup.component.css'],
})
export class WegvakPopupComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  private popupOpen = false;

  private formConfigs: FormConfigurations;

  @Input()
  public set config(config: string) {
    this.formConfigs = this.convertToFomConfig(config);
  }

  @Input()
  public set featureClicked(data: string) {
    const ff = this.convertToFormFeature(data);
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
      width: '750px',
      height: '800px',
      data: {
        formConfigs: this.formConfigs,
        formFeature,
        indexedAttributes:  this.convertFeatureToIndexed(formFeature),
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

  private convertToFormFeature(data: string): Feature {
    const f = JSON.parse(data);
    const id = f.id;
    const ft = id.substring(0, id.indexOf('.') );
    const formConfig = this.formConfigs.config[ft];
    const featureAttributes: FeatureAttribute[] = this.convertFeatureAttributes(formConfig, f.attributes);
    const feature: Feature = {
        id,
        featureType: ft,
        featureSource: '16',
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

  private convertFeatureToIndexed(feat: Feature): IndexedFeatureAttributes {
    const m = new Map<string, FeatureAttribute>();
    for (const attr of feat.attributes) {
      m.set(attr.key, attr);
    }
    return {attrs: m};
  }
}
