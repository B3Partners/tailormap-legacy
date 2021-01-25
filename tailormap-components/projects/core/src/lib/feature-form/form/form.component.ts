import { Component, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { filter, take, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, Subject } from 'rxjs';
import { FormConfiguration } from './form-models';
import { Feature } from '../../shared/generated';
import { FormActionsService } from '../form-actions/form-actions.service';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import { WorkflowActionManagerService } from '../../workflow/workflow-controller/workflow-action-manager.service';
import { WORKFLOW_ACTION } from '../../workflow/workflow-controller/workflow-models';
import { MetadataService } from '../../application/services/metadata.service';
import { FormState } from '../state/form.state';
import { Store } from '@ngrx/store';
import * as FormActions from '../state/form.actions';
import { selectCloseAfterSaveFeatureForm, selectFeatureFormOpen, selectOpenFeatureForm } from '../state/form.selectors';

@Component({
  selector: 'tailormap-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnDestroy, OnChanges, OnInit {
  public features: Feature[];
  public feature: Feature;
  public formConfig: FormConfiguration;

  public isBulk: boolean;
  public formsForNew: FormConfiguration[] = [];
  public formDirty: boolean;

  private destroyed = new Subject();
  public closeAfterSave = false;

  public isOpen$: Observable<boolean>;

  constructor(
              private store$: Store<FormState>,
              private confirmDialogService: ConfirmDialogService,
              private _snackBar: MatSnackBar,
              private ngZone: NgZone,
              private metadataService: MetadataService,
              private formConfigRepo: FormconfigRepositoryService,
              public actions: FormActionsService,
              public workflowAction: WorkflowActionManagerService) {
  }

  public ngOnInit(): void {
    combineLatest([
      this.store$.select(selectOpenFeatureForm),
      this.store$.select(selectCloseAfterSaveFeatureForm),
    ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(([features, closeAfterSave]) => {
        this.features = features;
        this.isBulk = features.length > 1;
        this.feature = this.features[0];
        this.closeAfterSave = closeAfterSave;
        if (this.feature) {
          this.initForm();
        }
      });

    this.isOpen$ = this.store$.select(selectFeatureFormOpen);
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private initForm() {
    this.formDirty = false;
    this.formConfig = this.formConfigRepo.getFormConfig(this.feature.clazz);
    if (!this.formConfig) {
  //    this.dialogRef.close(this.feature);
    }
   /* if (this.data.alreadyDirty) {
      this.formDirty = true;
    }*/
    this.metadataService.getFeatureTypeMetadata$(this.feature.clazz);
    const configs = this.formConfigRepo.getAllFormConfigs();
    configs.forEach((config, key) => {
      this.formsForNew.push(config);
    });
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
      if (this.closeAfterSave) {
        this.store$.dispatch(FormActions.setCloseFeatureForm());
      }
    }
  }

  public newItem(evt) {
    this.actions.newItem$(evt, this.features).pipe(takeUntil(this.destroyed)).subscribe(features => {
        this.features = features.features;
        this.feature = features.feature;
        this.initForm();
      });

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
    this.workflowAction.setAction({
      feature: this.features[0],
      action: WORKFLOW_ACTION.COPY,
    });
  }

  public editGeometry(): void {
    this.closeDialog();
    this.workflowAction.setAction({
      feature: this.feature,
      action: WORKFLOW_ACTION.EDIT_GEOMETRY,
    });
  }

  public closeDialog() {
    this.store$.dispatch(FormActions.setCloseFeatureForm());
    this.ngZone.run(() => {
      if (this.formDirty) {
        this.closeNotification(function () {
          this.store$.dispatch(FormActions.setCloseFeatureForm());
        });
      } else {
        this.store$.dispatch(FormActions.setCloseFeatureForm());
      }
    });
  }

  private closeNotification(afterAction) {
    this.confirmDialogService.confirm$('Formulier sluiten',
      'Wilt u het formulier sluiten? Niet opgeslagen wijzigingen gaan verloren.', true)
      .pipe(take(1), filter(remove => remove))
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        afterAction.call(this);
      });
  }

}
