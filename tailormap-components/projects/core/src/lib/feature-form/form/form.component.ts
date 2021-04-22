import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { FormConfiguration } from './form-models';
import { Feature } from '../../shared/generated';
import { FormActionsService } from '../form-actions/form-actions.service';
import { MetadataService } from '../../application/services/metadata.service';
import { FormState } from '../state/form.state';
import { Store } from '@ngrx/store';
import * as FormActions from '../state/form.actions';
import * as WorkflowActions from '../../workflow/state/workflow.actions';
import {
  selectCloseAfterSaveFeatureForm, selectCurrentFeature, selectFeatures, selectFormAlreadyDirty,
  selectFormEditing, selectFormVisible,
  selectIsMultiFormWorkflow,
} from '../state/form.selectors';
import { LayerUtils } from '../../shared/layer-utils/layer-utils.service';
import { WORKFLOW_ACTION } from '../../workflow/state/workflow-models';
import { WorkflowState } from '../../workflow/state/workflow.state';
import { selectFormConfigForFeatureTypeName, selectFormConfigs, selectVisibleLayers } from '../../application/state/application.selectors';
import { FormHelpers } from './form-helpers';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { toggleFeatureFormVisibility } from '../state/form.actions';
import { EditFeatureGeometryService } from '../services/edit-feature-geometry.service';
import { AttributeMetadataResponse } from '../../shared/attribute-service/attribute-models';
import { ExtendedFormConfigurationModel } from '../../application/models/extended-form-configuration.model';

@Component({
  selector: 'tailormap-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnDestroy, OnInit {

  public features: Feature[];
  public feature: Feature;
  public formConfig: FormConfiguration;

  public isBulk: boolean;
  public formsForNew: FormConfiguration[] = [];
  public formDirty: boolean;

  private destroyed = new Subject();
  public closeAfterSave = false;

  public isHidden$: Observable<boolean>;
  public editing$: Observable<boolean>;
  public isMultiFormWorkflow$: Observable<boolean>;

  constructor(
    private store$: Store<FormState | WorkflowState>,
    private confirmDialogService: ConfirmDialogService,
    private metadataService: MetadataService,
    private featureInitializerService: FeatureInitializerService,
    public actions: FormActionsService,
    private editFeatureGeometryService: EditFeatureGeometryService,
  ) {
  }

  public ngOnInit(): void {
    this.store$.select(selectCurrentFeature)
      .pipe(
        takeUntil(this.destroyed),
        switchMap(feature => combineLatest([
          of(feature),
          this.store$.select(selectFeatures),
        ])),
        filter(([ feature, _features ]) => !!feature && !!feature.clazz),
        switchMap(([ feature, features ]) => combineLatest([
          of(feature),
          of(features),
          this.store$.select(selectCloseAfterSaveFeatureForm),
          this.store$.select(selectFormAlreadyDirty),
          this.store$.select(selectFormConfigForFeatureTypeName, feature.clazz),
          this.store$.select(selectFormConfigs),
          this.store$.select(selectVisibleLayers).pipe(
            map(appLayers => {
              return appLayers.filter(appLayer =>
                LayerUtils.sanitizeLayername(
                  appLayer.userlayer ? appLayer.userlayer_original_layername : appLayer.layerName) === features[0].clazz,
              )[0];
            }),
            switchMap(layer => this.metadataService.getFeatureTypeMetadata$(layer.id).pipe(take(1))),
          ),
        ])),
      )
      .subscribe(([ feature, features, closeAfterSave, formAlreadyDirty, formConfig, allFormConfigs, metaDataResponse ]) => {
        this.initForm(feature, features, closeAfterSave, formAlreadyDirty, formConfig, allFormConfigs, metaDataResponse);
      });

    this.isHidden$ = this.store$.select(selectFormVisible).pipe(map(visible => !visible));
    this.editing$ = this.store$.select(selectFormEditing);
    this.isMultiFormWorkflow$ = this.store$.select(selectIsMultiFormWorkflow);
  }

  private initForm(
    feature: Feature,
    features: Feature[],
    closeAfterSave: boolean,
    formAlreadyDirty: boolean,
    formConfig: FormConfiguration,
    allFormConfigs: Map<string, ExtendedFormConfigurationModel>,
    metaDataResponse: AttributeMetadataResponse,
  ) {
    this.feature = { ...feature };
    this.formDirty = !!formAlreadyDirty;
    this.formConfig = formConfig;
    this.features = [...features];
    this.isBulk = features.length > 1;
    this.closeAfterSave = closeAfterSave;
    this.formsForNew = [];
    metaDataResponse.relations.forEach(rel => {
      const relationName = LayerUtils.sanitizeLayername(rel.foreignFeatureTypeName);
      if (allFormConfigs.has(relationName)) {
        this.formsForNew.push(allFormConfigs.get(relationName));
      }
    });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public formChanged(result: boolean) {
    this.formDirty = result;
  }

  public setFormEditing(editing) {
    this.store$.dispatch(FormActions.setFormEditing({ editing }));
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
        this.store$.dispatch(FormActions.setFormEditing({editing: true}));
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
      this.actions.removeFeature$(this.feature).subscribe(() => {
        this.store$.dispatch(FormActions.setFeatureRemoved({feature: this.feature}));
        if (!this.feature) {
          this.closeForm();
        }
      });
    });
  }

  public copy() {
    const copyFeature = { ...this.features[0] };
    this.closeForm();
    this.store$.dispatch(WorkflowActions.setFeature({
      feature: copyFeature,
      action: WORKFLOW_ACTION.COPY,
    }));
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
