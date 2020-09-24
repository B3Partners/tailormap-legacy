import {
  Component,
  Inject,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import {
  filter,
  take,
} from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DialogData } from '../form-popup/form-popup-models';
import { FormConfiguration } from './form-models';
import { Feature } from '../../shared/generated';
import { FormActionsService } from '../form-actions/form-actions.service';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import { GbiControllerService } from '../../shared/gbi-controller/gbi-controller.service';

@Component({
  selector: 'tailormap-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnDestroy, OnChanges {
  public features: Feature[];
  public feature: Feature;
  public formConfig: FormConfiguration;

  public isBulk: boolean;
  public formsForNew: FormConfiguration[] = [];
  public lookup: Map<string, string>;
  public formDirty: boolean;

  private subscriptions = new Subscription();

  constructor(public dialogRef: MatDialogRef<FormComponent>,
              private confirmDialogService: ConfirmDialogService,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              private _snackBar: MatSnackBar,
              private formConfigRepo: FormconfigRepositoryService,
              public actions: FormActionsService,
              public gbiService: GbiControllerService) {

    this.features = data.formFeatures;
    this.feature = this.features[0];
    this.isBulk = !!data.isBulk;
    this.lookup = data.lookup;
    const configs = this.formConfigRepo.getAllFormConfigs().config;
    for (const key in configs) {
      if (configs.hasOwnProperty(key)) {
        const cf: FormConfiguration = configs [key];
        this.formsForNew.push(cf);
      }
    }

    this.initForm();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initForm() {
    this.formDirty = false;
    this.formConfig = this.formConfigRepo.getFormConfig(this.feature.clazz);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  public openForm(feature) {
    if (feature && !this.isBulk) {
      if (this.formDirty) {
        this.closeNotification(function () {
          this.feature = feature;
          this.initForm();
        });
      } else {
        this.feature = feature;
        this.initForm();
      }
    }
  }

  public formChanged(result: any) {
    this.formDirty = result.changed;
    if (!result.changed) {
      this.features = result.features;
      this.feature = result.feature;
    }
  }

  public newItem(evt) {
    this.subscriptions.add(
      this.actions.newItem$(evt, this.features).subscribe(features => {
        this.features = features.features;
        this.feature = features.feature;
        this.initForm();
      }),
    );
  }

  public remove() {
    const attribute = Object.keys(this.feature).find(searchAttribute => searchAttribute === this.formConfig.treeNodeColumn);
    let message = 'Wilt u ' + this.formConfig.name + ' - ' + this.feature[attribute] + ' verwijderen?';
    if (this.feature.children && this.feature.children.length > 0) {
      message += ' Let op! Alle onderliggende objecten worden ook verwijderd.'
    }
    this.confirmDialogService.confirm$('Verwijderen',
      message, true)
      .pipe(take(1), filter(remove => remove)).subscribe(() => {
      this.actions.removeFeature$(this.feature, this.features).subscribe(result => {
        this.features = result.features;
        this.feature = result.features[0];
        if (!this.feature) {
          this.closeDialog();
        }
      });
    });
  }

  public copy() {
    this.closeDialog();
    this.gbiService.copyModeChange$.next(this.feature);
  }

  public closeDialog() {
    if (this.formDirty) {
      this.closeNotification(function () {
        this.dialogRef.close();
      });
    } else {
      this.dialogRef.close();
    }
  }

  private closeNotification(afterAction) {
    this.confirmDialogService.confirm$('Formulier sluiten',
      'Wilt u het formulier sluiten? Niet opgeslagen wijzigingen gaan verloren.', true)
      .pipe(take(1), filter(remove => remove))
      // tslint:disable-next-line: rxjs-no-ignored-subscription
      .subscribe(() => {
        afterAction.call(this);
      });
  }

}
