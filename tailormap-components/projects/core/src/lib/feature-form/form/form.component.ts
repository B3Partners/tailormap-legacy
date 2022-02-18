import { Component, ElementRef, Inject, OnDestroy, OnInit } from '@angular/core';
import { ConfirmDialogService } from '@tailormap/shared';
import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { Attribute, FormConfiguration, TabbedField, TabColumn } from './form-models';
import { Feature } from '../../shared/generated';
import { FormActionsService } from '../form-actions/form-actions.service';
import { MetadataService } from '../../application/services/metadata.service';
import { FormState } from '../state/form.state';
import { Store } from '@ngrx/store';
import * as FormActions from '../state/form.actions';
import { toggleFeatureFormVisibility } from '../state/form.actions';
import * as WorkflowActions from '../../workflow/state/workflow.actions';
import {
  selectCurrentFeature, selectFeatures, selectFormAlreadyDirty, selectFormEditing, selectFormRelationsForCurrentFeature, selectFormVisible,
  selectInBulkEditMode, selectIsMultiFormWorkflow,
} from '../state/form.selectors';
import { WORKFLOW_ACTION } from '../../workflow/state/workflow-models';
import { WorkflowState } from '../../workflow/state/workflow.state';
import { selectFormConfigForFeatureTypeName, selectFormConfigs } from '../../application/state/application.selectors';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { EditFeatureGeometryService } from '../services/edit-feature-geometry.service';
import { ExtendedFormConfigurationModel } from '../../application/models/extended-form-configuration.model';
import { METADATA_SERVICE } from '@tailormap/api';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { FormTreeHelpers } from '../form-tree/form-tree-helpers';
import { FormRelationModel } from '../state/form-relation.model';

@Component({
  selector: 'tailormap-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnDestroy, OnInit {

  public features: Feature[];
  public feature: Feature;
  public formConfig: FormConfiguration;
  public initComplete = false;
  public currentParentFeature: string | null = null;

  public isBulk: boolean;
  public formsForNew: FormConfiguration[] = [];
  public formDirty: boolean;
  public formValid: boolean;

  private destroyed = new Subject();

  public isHidden$: Observable<boolean>;
  public editing$: Observable<boolean>;
  public isMultiFormWorkflow$: Observable<boolean>;
  public formTabs: TabbedField[] = [];
  public formRelations$: Observable<FormRelationModel | null>;

  constructor(
    private store$: Store<FormState | WorkflowState>,
    private confirmDialogService: ConfirmDialogService,
    @Inject(METADATA_SERVICE) private metadataService: MetadataService,
    private featureInitializerService: FeatureInitializerService,
    public actions: FormActionsService,
    private editFeatureGeometryService: EditFeatureGeometryService,
    private formElement: ElementRef,
    private tailormapService: TailorMapService,
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
        filter(([ feature, _features ]) => !!feature && !!feature.tableName),
        switchMap(([ feature, features ]) => combineLatest([
          of(feature),
          of(features),
          this.store$.select(selectInBulkEditMode),
          this.store$.select(selectFormAlreadyDirty),
          this.store$.select(selectFormConfigForFeatureTypeName, feature.tableName),
          this.store$.select(selectFormConfigs),
        ])),
      )
      .subscribe(([ feature, features, isBulkEdit, formAlreadyDirty, formConfig, allFormConfigs ]) => {
        this.initForm(feature, features, isBulkEdit, formAlreadyDirty, formConfig, allFormConfigs);
      });

    this.isHidden$ = this.store$.select(selectFormVisible).pipe(map(visible => !visible));
    this.editing$ = this.store$.select(selectFormEditing);
    this.isMultiFormWorkflow$ = this.store$.select(selectIsMultiFormWorkflow);

    this.formRelations$ = this.store$.select(selectFormRelationsForCurrentFeature);
  }

  private initForm(
    feature: Feature,
    features: Feature[],
    isBulkEdit: boolean,
    formAlreadyDirty: boolean,
    formConfig: FormConfiguration,
    allFormConfigs: Map<string, ExtendedFormConfigurationModel>,
  ) {
    this.initComplete = true;
    if (!formConfig) {
      return;
    }
    this.feature = { ...feature };
    this.formDirty = !!formAlreadyDirty;
    this.formConfig = formConfig;
    this.features = [...features];
    this.isBulk = isBulkEdit;
    this.formsForNew = (feature.relations || [])
      .filter(relation => {
        return allFormConfigs.has(relation.foreignFeatureTypeName) && !relation.canCreateNewRelation;
      })
      .map(relation => allFormConfigs.get(relation.foreignFeatureTypeName));
    this.formTabs = this.prepareFormConfig();
    this.formElement.nativeElement.style
      .setProperty('--overlay-panel-form-columns', `${this.getMaxColumnCount(features, allFormConfigs)}`);
  }

  private prepareFormConfig(): Array<TabbedField> {
    const tabbedFields = [];
    for (let tabNr = 1; tabNr <= this.formConfig.tabs; tabNr++) {
      tabbedFields.push({
        tabId: tabNr,
        label: this.formConfig.tabConfig[tabNr],
        columns: this.getColumns(tabNr),
      });
    }
    return tabbedFields;
  }

  public getColumns(tabNr: number): TabColumn[] {
    const columns: TabColumn[] = [];
    const columnCount = this.getColumnCount();
    for (let i = 1; i <= columnCount; i++) {
      columns.push({
        columnId: i,
        attributes: this.getAttributes(i, tabNr),
      });
    }
    return columns;
  }

  public getAttributes(column: number, tabNr: number): Attribute[] {
    return this.formConfig.fields.filter(attr => attr.column === column && attr.tab === tabNr);
  }

  private getColumnCount() {
    return this.getColumnCountForFormConfig(this.formConfig);
  }

  private getMaxColumnCount(features: Feature[], allFormConfigs: Map<string, ExtendedFormConfigurationModel>) {
    const columnCounts = new Map<string, number>();
    features.forEach(f => {
      if (!columnCounts.has(f.tableName) && allFormConfigs.has(f.tableName)) {
        const columnCount = this.getColumnCountForFormConfig(allFormConfigs.get(f.tableName));
        columnCounts.set(f.tableName, columnCount);
      }
    });
    return Math.max(...columnCounts.values());
  }

  private getColumnCountForFormConfig(formConfig: FormConfiguration) {
    return formConfig.fields
      .reduce((total, field) => Math.max(total, field.column), 0);
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public formChanged(result: boolean) {
    this.formDirty = result;
  }

  public formValidChanged(result: boolean) {
    this.formValid = result;
  }

  public isCreatingNew() {
    return this.feature.fid === FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT;
  }

  public setFormEditing(editing) {
    this.store$.dispatch(FormActions.setFormEditing({ editing }));
  }

  public newItem(formConfig: FormConfiguration) {
    const parentFeature = this.feature;
    const relation = (parentFeature.relations || []).find(r => r.foreignFeatureTypeName === formConfig.featureType);
    if (!relation) {
      return;
    }
    this.featureInitializerService.create$(formConfig.featureType, {
      [formConfig.treeNodeColumn]: `Nieuwe ${formConfig.name}`,
    }).subscribe(newFeature => {
      this.currentParentFeature = this.feature.fid;
      this.store$.dispatch(FormActions.setNewFeature({ newFeature, parentId: this.feature.fid }));
      this.store$.dispatch(FormActions.setFormEditing({ editing: true }));
    });
  }

  public remove() {
    const attributeLabel = FormTreeHelpers.getFeatureValueForField(this.feature, this.formConfig, this.formConfig.treeNodeColumn);
    let message = 'Wilt u ' + this.formConfig.name + ' - ' + attributeLabel + ' verwijderen?';
    if (this.feature.children && this.feature.children.length > 0) {
      message += ' Let op! Alle onderliggende objecten worden ook verwijderd.';
    }
    this.confirmDialogService.confirm$('Verwijderen',
      message, true)
      .pipe(take(1), filter(remove => remove)).subscribe(() => {
      this.actions.removeFeature$(this.feature).subscribe(() => {
        this.store$.dispatch(FormActions.setFeatureRemoved({ feature: this.feature }));
        if (!this.feature) {
          this.closeForm();
        }
        this.tailormapService.getViewerController().mapComponent.getMap().update();
      });
    });
  }

  public copy() {
    const copyFeature = { ...this.features[0] };
    this.store$.dispatch(WorkflowActions.setFeature({
      feature: copyFeature,
      action: WORKFLOW_ACTION.COPY,
    }));
  }

  public createRelations() {
    this.store$.dispatch(WorkflowActions.setAction({ action: WORKFLOW_ACTION.CREATE_RELATIONS }));
    this.store$.dispatch(FormActions.openRelationsForm());
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
        const geomField = this.feature.defaultGeometryField;
        if (!geomField) {
          return;
        }
        const geomFieldIndex = this.feature.attributes.findIndex(f => f.key === geomField);
        if (geomFieldIndex === -1) {
          return;
        }
        const geomFieldValues = this.feature.attributes[geomFieldIndex];
        this.feature = {
          ...this.feature,
          attributes: [
            ...this.feature.attributes.slice(0, geomFieldIndex),
            {
              ...geomFieldValues,
              value: geometry,
            },
            ...this.feature.attributes.slice(geomFieldIndex + 1),
          ],
        };
        this.actions.save$(this.feature).subscribe(savedFeature => {
          this.tailormapService.getViewerController().mapComponent.getMap().update();
          this.store$.dispatch(FormActions.setFeature({ feature: savedFeature }));
        });
      });
  }

  public closeForm() {
    this.confirm(() => this.store$.dispatch(FormActions.setCloseFeatureForm()));
  }

  public cancelForm() {
    this.confirm(() => {
      const isNewlyCreatedFeature = this.features.length === 1 && (this.features[0].children || []).length === 0;
      if ((this.isCreatingNew() && isNewlyCreatedFeature) || this.isBulk) {
        this.store$.dispatch(FormActions.setCloseFeatureForm());
        return;
      }
      this.store$.dispatch(FormActions.setFormEditing({editing: false}));
      this.formChanged(false);
      let feature = { ...this.feature };
      if (this.feature.fid === FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT) {
        feature = { ...this.findFeatureById(this.features, this.currentParentFeature) };
        this.store$.dispatch(FormActions.setFeatureRemoved({ feature: this.feature }));
      }
      this.store$.dispatch(FormActions.setFeature({ feature }));
      this.currentParentFeature = null;
    });
  }

  private findFeatureById(features: Feature[], fid: string) {
    let feature;
    features.forEach(f => {
      if (f.fid === fid) {
        feature = f;
      } else if ((f.children || []).length > 0) {
        feature = this.findFeatureById(f.children, fid) || feature;
      }
    });
    return feature;
  }

  private confirm(callback: () => void) {
    let confirm$: Observable<boolean> = of(true);
    if (this.formDirty || this.isCreatingNew()) {
      confirm$ = this.confirmDialogService.confirm$(
        'Formulier sluiten',
        'Wilt u het formulier sluiten? Niet opgeslagen wijzigingen gaan verloren.',
        true);
    }
    confirm$
      .pipe(
        take(1),
        filter(remove => remove),
      )
      .subscribe(() => callback());
  }

  public isSaveAllowed() {
    return this.formDirty && (this.isBulk || this.formValid);
  }

}
