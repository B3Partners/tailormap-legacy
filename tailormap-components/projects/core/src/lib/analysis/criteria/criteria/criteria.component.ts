import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../../state/analysis.state';
import { selectSelectedDataSource } from '../../state/analysis.selectors';
import { concatMap, debounceTime, filter, take, takeUntil } from 'rxjs/operators';
import { forkJoin, of, Subject } from 'rxjs';
import { MetadataService } from '../../../application/services/metadata.service';
import { AttributeMetadataResponse } from '../../../shared/attribute-service/attribute-models';
import { AnalysisSourceModel } from '../../models/analysis-source.model';
import { CriteriaConditionModel } from '../../models/criteria-condition.model';
import { AttributeTypeEnum } from '../../../shared/models/attribute-type.enum';
import { ExtendedAttributeModel } from '../../../application/models/extended-attribute.model';
import { METADATA_SERVICE } from '@tailormap/api';
import { selectFormConfigs } from '../../../application/state/application.selectors';
import { ExtendedFormConfigurationModel } from '../../../application/models/extended-form-configuration.model';
import { AttributeSource, CriteriaHelper } from '../helpers/criteria.helper';

@Component({
  selector: 'tailormap-criteria',
  templateUrl: './criteria.component.html',
  styleUrls: ['./criteria.component.css'],
})
export class CriteriaComponent implements OnInit, OnDestroy {

  @Input()
  public criteria: CriteriaConditionModel;

  @Input()
  public showRemoveLink?: boolean;

  @Output()
  public criteriaChanged: EventEmitter<CriteriaConditionModel> = new EventEmitter<CriteriaConditionModel>();

  @Output()
  public criteriaRemoved: EventEmitter<CriteriaConditionModel> = new EventEmitter<CriteriaConditionModel>();

  private destroyed = new Subject();
  public availableSources: AttributeSource[] = [];

  public criteriaForm = this.fb.group({
    source: [''],
    attribute: [''],
  });

  public formData: Omit<CriteriaConditionModel, 'id' | 'condition' | 'value'> = {};
  public attributeFilter: { condition?: string; value?: string[] } = {};
  public updatedAttributeFilter: { condition?: string; value?: string[] } = {};

  public selectedDataSource: AnalysisSourceModel;

  constructor(
    private fb: FormBuilder,
    private store$: Store<AnalysisState>,
    @Inject(METADATA_SERVICE) private metadataService: MetadataService,
  ) { }

  public ngOnInit(): void {
    this.criteriaForm.valueChanges
      .pipe(
        takeUntil(this.destroyed),
        debounceTime(250),
      )
      .subscribe(formValues => {
        const source = this.availableSources.find(src => src.featureType === +(formValues.source));
        if (!source) {
          return;
        }
        this.formData = {
          ...this.formData,
          source: source.featureType,
          relatedTo: source.relatedTo,
        };
        this.emitChanges();
      });

    this.store$.select(selectSelectedDataSource)
      .pipe(
        takeUntil(this.destroyed),
        filter(selectedDataSource => !!selectedDataSource),
        concatMap(selectedDataSource => {
          return forkJoin([
            of(selectedDataSource),
            this.metadataService.getFeatureTypeMetadata$(selectedDataSource.layerId),
            this.store$.select(selectFormConfigs).pipe(take(1)),
          ]);
        }),
      )
      .subscribe(([ selectedDataSource, layerMetadata, formConfigs ]) => {
        this.selectedDataSource = selectedDataSource;
        this.setupFormValues(selectedDataSource, layerMetadata, formConfigs);
        this.setInitialValues();
      });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private setupFormValues(
    selectedDataSource: AnalysisSourceModel,
    layerMetadata: AttributeMetadataResponse,
    formConfigs: Map<string, ExtendedFormConfigurationModel>,
  ) {
    this.availableSources = CriteriaHelper.getAvailableSources(selectedDataSource, layerMetadata, formConfigs);
  }

  private setInitialValues() {
    if (!this.criteria) {
      return;
    }

    const initialCriteria = { ...this.criteria };

    if (!initialCriteria.source && this.availableSources.length > 0 && !this.criteria.attribute) {
      initialCriteria.source = this.availableSources[0].featureType;
    }

    if (this.criteria.attribute) {
      this.formData = {
        ...this.formData,
        attribute: initialCriteria.attribute,
      };
    }

    this.criteriaForm.patchValue({
      ...initialCriteria,
    });

    this.attributeFilter = {
      ...this.attributeFilter,
      value: initialCriteria.value,
      condition: initialCriteria.condition,
    };

    this.updatedAttributeFilter = { ...this.attributeFilter };

  }

  public updateAttributeFilter(attributeFilter: { condition: string; value: string[] }) {
    this.updatedAttributeFilter = { ...this.attributeFilter, ...attributeFilter };
    this.emitChanges();
  }

  private emitChanges() {
    const criteria = {
      id: this.criteria.id,
      ...this.formData,
      ...this.updatedAttributeFilter,
    };
    this.criteriaChanged.emit(criteria);
  }

  public removeCriteria() {
    this.criteriaRemoved.emit(this.criteria);
  }

  public attributeSelected($event: { attribute: ExtendedAttributeModel; attributeType: AttributeTypeEnum }) {
    this.formData = {
      ...this.formData,
      attribute: $event.attribute.name,
      attributeType: $event.attributeType,
      attributeAlias: $event.attribute.alias,
    };
    this.emitChanges();
  }

}
