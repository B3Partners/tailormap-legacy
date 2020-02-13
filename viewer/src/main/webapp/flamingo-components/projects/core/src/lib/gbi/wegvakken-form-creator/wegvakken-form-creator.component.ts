import { Component,  Input, OnChanges, OnDestroy } from '@angular/core';
import { FormConfiguration, TabbedFields, Feature, ColumnizedFields, Attribute,
   IndexedFeatureAttributes} from '../../shared/wegvakken-models';
import { WegvakkenFormSaveService } from '../wegvakken-form-save.service';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'flamingo-wegvakken-form-creator',
  templateUrl: './wegvakken-form-creator.component.html',
  styleUrls: ['./wegvakken-form-creator.component.css'],
})
export class WegvakkenFormCreatorComponent implements OnChanges, OnDestroy {

  @Input()
  public formConfig: FormConfiguration;
  @Input()
  public feature: Feature;
  @Input()
  public features: Feature[];
  @Input()
  public indexedAttributes: IndexedFeatureAttributes;
  @Input()
  public applicationId: string;
  @Input()
  public isBulk = false;
  @Input()
  public lookup: Map<string, string>;

  public tabbedConfig: TabbedFields;

  public formgroep = new FormGroup({});

  private subscriptions = new Subscription();

  constructor(
    private saveService: WegvakkenFormSaveService,
    private _snackBar: MatSnackBar) {
  }

  public ngOnChanges() {
    this.tabbedConfig = this.prepareFormConfig();
    this.createFormControls();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private prepareFormConfig(): TabbedFields {
    const tabbedFields: TabbedFields = {tabs: new Map<number, ColumnizedFields>()};
    const attrs = this.formConfig.fields;
    for (let tabNr = 1 ; tabNr <= this.formConfig.tabs ; tabNr++) {
      const fields: Attribute[] = [];
      attrs.forEach(attr => {
        if (attr.tab === tabNr) {
          fields.push(attr);
        }
      });
      tabbedFields.tabs.set(tabNr, this.getColumizedFields(fields));
    }
    return tabbedFields;
  }

  private getColumizedFields(attrs: Attribute[]): ColumnizedFields {
    const columnizedFields: ColumnizedFields = {columns: new Map<number, Attribute[]>()};
    if (attrs.length === 0) {
      return columnizedFields;
    }
    const numCols = attrs.reduce((max, b) => Math.max(max, b.column), attrs[0].column);
    for (let col = 1 ; col <= numCols ; col++) {
      const fields: Attribute[] = [];
      attrs.forEach(attr => {
        if (attr.column === col) {
          fields.push(attr);
        }
      });
      columnizedFields.columns.set(col, fields);
    }
    return columnizedFields;
  }

  private createFormControls() {
    const lookup = {};
    this.feature.attributes.forEach(a => {
      lookup [a.key] = a;
    });
    const attrs = this.formConfig.fields;
    const formControls = {};
    for ( const attr of attrs) {
      formControls[attr.key] = new FormControl(!this.isBulk && lookup[attr.key] ? lookup[attr.key].value : null);
    }
    this.formgroep = new FormGroup(formControls);
  }

  public save() {
    if (this.isBulk) {
      const features = this.getChangedValues();
      this.subscriptions.add(this.saveService.savebulk( features, this.feature.appLayer, this.applicationId).subscribe(
        (d) => {
            if (d.success) {
              this._snackBar.open('Opgeslagen', '', {
                duration: 5000,
              });
            } else {
              this._snackBar.open('Fout: Niet opgeslagen: ' + d.error, '', {
                duration: 5000,
              });
            }
        },
        error => {
          this._snackBar.open('Fout: Niet opgeslagen: ' + error, '', {
            duration: 5000,
          });
        },
      ));
    } else {
      const feature = this.formgroep.value;
      feature.__fid = this.feature.id;
      this.subscriptions.add(this.saveService.save( this.feature, feature, this.feature.appLayer, this.applicationId).subscribe(
        (d) => {
            if (d.success) {
              this._snackBar.open('Opgeslagen', '', {
                duration: 5000,
              });
            } else {
              this._snackBar.open('Fout: Niet opgeslagen: ' + d.error, '', {
                duration: 5000,
              });
            }
        },
        error => {
          this._snackBar.open('Fout: Niet opgeslagen: ' + error, '', {
            duration: 5000,
          });
        },
      ));
    }
  }

  public getChangedValues(): Feature[] {
    let features = [];
    if (this.formgroep.dirty) {
      const attributes = [];
      for ( const key in this.formgroep.controls) {
        if (this.formgroep.controls.hasOwnProperty(key)) {
          const control = this.formgroep.controls[key];
          if (control.dirty) {
            attributes[key] = control.value;
          }
        }
      }
      features = [...this.features];
      features.forEach(f => f.attributes = attributes);
    }
    return features;
  }

}
