import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { filter, take, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, Subject } from 'rxjs';
import { FormConfiguration } from './form-models';
import { Feature } from '../../shared/generated';
import { FormActionsService } from '../form-actions/form-actions.service';
import { MetadataService } from '../../application/services/metadata.service';
import { FormState } from '../state/form.state';
import { Store } from '@ngrx/store';
import * as FormActions from '../state/form.actions';
import * as WorkflowActions from '../../workflow/state/workflow.actions';
import {
  selectCloseAfterSaveFeatureForm, selectCurrentFeature, selectFeatureFormOpen, selectFeatures, selectFormAlreadyDirty, selectFormEditting,
  selectTreeOpen,
} from '../state/form.selectors';
import { LayerUtils } from '../../shared/layer-utils/layer-utils.service';
import { WORKFLOW_ACTION } from '../../workflow/state/workflow-models';
import { WorkflowState } from '../../workflow/state/workflow.state';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { selectFormConfigForFeatureTypeName, selectFormConfigs, selectVisibleLayers } from '../../application/state/application.selectors';
import { FormHelpers } from './form-helpers';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { toggleFeatureFormVisibility } from '../state/form.actions';
import { EditFeatureGeometryService } from '../services/edit-feature-geometry.service';

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
  public treeOpen$: Observable<boolean>;
  public editting$: Observable<boolean>;

  constructor(
    private store$: Store<FormState | WorkflowState>,
    private confirmDialogService: ConfirmDialogService,
    private _snackBar: MatSnackBar,
    private metadataService: MetadataService,
    private featureInitializerService: FeatureInitializerService,
    public actions: FormActionsService,
    private editFeatureGeometryService: EditFeatureGeometryService,
  ) {
  }

  public ngOnInit(): void {
    combineLatest([
      this.store$.select(selectFeatures),
      this.store$.select(selectCloseAfterSaveFeatureForm),
    ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(([features, closeAfterSave]) => {
        this.features = [...features];
        this.isBulk = features.length > 1;
        this.closeAfterSave = closeAfterSave;
    });

    this.store$.select(selectFormAlreadyDirty).pipe(takeUntil(this.destroyed)).subscribe(value => this.formDirty = value);
    this.store$.select(selectCurrentFeature).pipe(takeUntil(this.destroyed)).subscribe((feature) => {
      this.feature = {...feature};
      if (this.feature.clazz) {
        this.initForm();
      }
    });
    this.isOpen$ = this.store$.select(selectFeatureFormOpen);
    this.treeOpen$ = this.store$.select(selectTreeOpen);
    this.editting$ = this.store$.select(selectFormEditting);
  }

  public openTree(event: MatButtonToggleChange): void {
    this.store$.dispatch(FormActions.setTreeOpen({treeOpen: event.source.checked}));
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private initForm() {
    this.formDirty = false;
    combineLatest([
      this.store$.select(selectFormConfigForFeatureTypeName, this.feature.clazz),
      this.store$.select(selectFormConfigs),
      this.store$.select(selectVisibleLayers),
    ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(([formConfig, configs, appLayers]) => {
      this.formConfig = formConfig;
      const layer = appLayers.filter(appLayer => LayerUtils.sanitizeLayername(appLayer.layerName) === this.features[0].clazz)[0];
      this.metadataService.getFeatureTypeMetadata$(layer.id).pipe(take(1)).subscribe((response) => {
        const relNames: string[] = [];
        response.relations.forEach(rel => {
          relNames.push(LayerUtils.sanitizeLayername(rel.foreignFeatureTypeName));
        });
        this.formsForNew = [];
        configs.forEach((config, key) => {
          if (relNames.indexOf(key) !== -1) {
            this.formsForNew.push(config);
          }
        });
      });
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  public formChanged(result: boolean) {
    this.formDirty = result;
  }

  public setFormEditting(editting) {
    this.store$.dispatch(FormActions.setFormEditting({editting}));
  }

  public newItem($event: MouseEvent, featureTypeName: string) {
    const type = LayerUtils.sanitizeLayername(featureTypeName);

    combineLatest([
      this.store$.select(selectFormConfigForFeatureTypeName, type),
      this.store$.select(selectFeatures),
    ])
      .pipe(take(1))
      .subscribe(([formConfig, features]) => {
        const objecttype = FormHelpers.capitalize(type);
        const newFeature = this.featureInitializerService.create(objecttype, {
          id: null,
          clazz: type,
          isRelated: true,
          objecttype,
          children: null,
          [formConfig.treeNodeColumn]: `Nieuwe ${formConfig.name}`,
        });
        this.store$.dispatch(FormActions.setNewFeature({newFeature, parentId: features[0].objectGuid}));
        this.store$.dispatch(FormActions.setFormEditting({editting: true}));
      });
  }

  public remove() {
    const attribute = Object.keys(this.feature).find(searchAttribute => searchAttribute === this.formConfig.treeNodeColumn);
    let message = 'Wilt u ' + this.formConfig.name + ' - ' + this.feature[attribute] + ' verwijderen?';
    if (this.feature.children && this.feature.children.length > 0) {
      message += ' Let op! Alle onderliggende objecten worden ook verwijderd.';
    }
    this.confirmDialogService.confirm$('Verwijderen',
      message, true)
      .pipe(take(1), filter(remove => remove)).subscribe(() => {
      this.actions.removeFeature$(this.feature).subscribe(result => {
        this.store$.dispatch(FormActions.setFeatureRemoved({feature: this.feature}));
        if (!this.feature) {
          this.closeForm();
        }
      });
    });
  }

  public copy() {
    this.store$.dispatch(WorkflowActions.setFeature({
      feature: {...this.features[0]},
      action: WORKFLOW_ACTION.COPY,
    }));
    this.closeForm();
  }

  public editGeometry(): void {
    this.store$.dispatch(toggleFeatureFormVisibility({ visible: false }));
    this.editFeatureGeometryService.updateCurrentFeatureGeometry$()
      .pipe(takeUntil(this.destroyed))
      .subscribe(geometry => {
        this.store$.dispatch(toggleFeatureFormVisibility({ visible: true }));
        if (!geometry) {
          return;
        }
        const geomField = this.featureInitializerService.retrieveGeometryField(this.feature);
        if (!geomField) {
          return;
        }
        this.feature = {
          ...this.feature,
          [geomField]: geometry,
        };
      });
  }

  public closeForm() {
    if (this.formDirty) {
      this.closeNotification(function () {
        this.store$.dispatch(FormActions.setCloseFeatureForm());
      });
    } else {
      this.store$.dispatch(FormActions.setCloseFeatureForm());
    }
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
