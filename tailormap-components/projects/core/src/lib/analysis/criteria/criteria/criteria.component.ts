import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../../state/analysis.state';
import { selectSelectedDataSource } from '../../state/analysis.selectors';
import { concatMap, debounceTime, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, of, Subject } from 'rxjs';
import { MetadataService } from '../../../application/services/metadata.service';
import { Attribute, AttributeMetadataResponse } from '../../../shared/attribute-service/attribute-models';
import { AnalysisSourceModel } from '../../models/analysis-source.model';
import { CriteriaConditionModel } from '../../models/criteria-condition.model';
import { CriteriaHelper } from '../helpers/criteria.helper';
import { AttributeTypeEnum } from '../../../application/models/attribute-type.enum';
import { CriteriaConditionTypeModel } from '../../models/criteria-condition-type.model';
import * as moment from 'moment';

type AttributeSource = Omit<AnalysisSourceModel, 'geometryType' | 'geometryAttribute'>;

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
  public availableSources: AttributeSource[];

  private filteredConditionsSubject$ = new BehaviorSubject<CriteriaConditionTypeModel[]>([]);
  public filteredConditions$ = this.filteredConditionsSubject$.asObservable();

  public criteriaForm = this.fb.group({
    source: [''],
    attribute: [''],
    condition: [''],
    value: [''],
  });

  public formData: Omit<CriteriaConditionModel, 'id'> = {}
  public selectedDataSource: AnalysisSourceModel;

  constructor(
    private fb: FormBuilder,
    private store$: Store<AnalysisState>,
    private metadataService: MetadataService,
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
        let relatedTo: number;
        if (source.featureType !== this.selectedDataSource.featureType) {
          relatedTo = this.selectedDataSource.layerId;
        }
        this.formData = {
          ...this.formData,
          source: source.featureType,
          condition: formValues.condition,
          value: formValues.value,
          relatedTo,
        };
        this.setDisabledState();
        this.emitChanges();
      });

    this.store$.select(selectSelectedDataSource)
      .pipe(
        takeUntil(this.destroyed),
        concatMap(selectedDataSource => {
          return forkJoin([ of(selectedDataSource), this.metadataService.getFeatureTypeMetadata$(selectedDataSource.layerId) ])
        }),
      )
      .subscribe(([ selectedDataSource, layerMetadata ]) => {
        this.selectedDataSource = selectedDataSource;
        this.setupFormValues(selectedDataSource, layerMetadata);
        this.setInitialValues();
      });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private setupFormValues(selectedDataSource: AnalysisSourceModel, layerMetadata: AttributeMetadataResponse) {
    const relationSources = layerMetadata.relations.map<AttributeSource>(relation => ({
      featureType: relation.foreignFeatureType,
      label: `${relation.foreignFeatureTypeName}`,
    }));
    this.availableSources = [
      {featureType: selectedDataSource.featureType, label: selectedDataSource.label},
      ...relationSources,
    ];
  }

  private setInitialValues() {
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
    if (initialCriteria.attributeType) {
      this.filteredConditionsSubject$.next(this.getConditionsForAttributeType(initialCriteria.attributeType));
    }

    let value: string | moment.Moment = initialCriteria.value;
    if (value && initialCriteria.attributeType === AttributeTypeEnum.DATE) {
      value = moment(value);
    }

    this.criteriaForm.patchValue({
      ...initialCriteria,
      value,
    });
  }

  private getConditionsForAttributeType(attributeType: AttributeTypeEnum) {
    return CriteriaHelper.getConditionTypes().filter(c => c.attributeType === attributeType);
  }

  private emitChanges() {
    let value: string | moment.Moment = this.formData.value;
    if (value && this.formData.attributeType === AttributeTypeEnum.DATE && moment.isMoment(value)) {
      value = value.toISOString();
    }
    const criteria = {
      id: this.criteria.id,
      ...this.formData,
      value,
    };
    this.criteriaChanged.emit(criteria);
  }

  public removeCriteria() {
    this.criteriaRemoved.emit(this.criteria);
  }

  public setDisabledState() {
    const hasAttribute = !!this.formData.attribute && !!this.formData.attributeType;
    if (hasAttribute) {
      this.criteriaForm.controls.condition.enable({ emitEvent: false });
      this.criteriaForm.controls.value.enable({ emitEvent: false });
    } else {
      this.criteriaForm.controls.condition.disable({ emitEvent: false });
      this.criteriaForm.controls.value.disable({ emitEvent: false });
    }
  }

  public showValueInput() {
    return this.formData.attributeType === AttributeTypeEnum.STRING || this.formData.attributeType === AttributeTypeEnum.NUMBER;
  }

  public showDateInput() {
    return this.formData.attributeType === AttributeTypeEnum.DATE;
  }

  public attributeSelected($event: { attribute: Attribute; attributeType: AttributeTypeEnum }) {
    if (this.formData.attributeType !== $event.attributeType) {
      this.filteredConditionsSubject$.next(this.getConditionsForAttributeType($event.attributeType));
    }
    this.formData = {
      ...this.formData,
      attribute: $event.attribute.name,
      attributeType: $event.attributeType,
    };
    this.setDisabledState();
    this.emitChanges();
  }

}
