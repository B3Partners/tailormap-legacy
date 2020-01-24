import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WegvakkenFormComponent } from '../wegvakken-form/wegvakken-form.component';
import { MatDialog } from '@angular/material';
import { Feature, DialogClosedData, FormConfigurations, IndexedFeatureAttributes, FeatureAttribute } from '../../shared/wegvakken-models';

@Component({
  selector: 'flamingo-wegvak-popup',
  templateUrl: './wegvak-popup.component.html',
  styleUrls: ['./wegvak-popup.component.css'],
})
export class WegvakPopupComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  private popupOpen = false;

  private formConfig: FormConfigurations;

  @Input()
  public set config(config: string) {
    this.formConfig = this.convertToFomConfig(config);
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
        formConfig: this.formConfig,
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
    return JSON.parse(data);
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
