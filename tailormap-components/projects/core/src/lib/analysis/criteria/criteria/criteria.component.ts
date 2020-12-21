import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../../state/analysis.state';
import { selectSelectedDataSource } from '../../state/analysis.selectors';
import { concatMap, debounceTime, map, startWith, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of, Subject } from 'rxjs';
import { MetadataService } from '../../../application/services/metadata.service';
import { Attribute, AttributeMetadataResponse } from '../../../shared/attribute-service/attribute-models';
import { AnalysisSourceModel } from '../../models/analysis-source.model';
import { CriteriaConditionModel } from '../../models/criteria-condition.model';
import { CriteriaHelper } from '../helpers/criteria.helper';
import { AttributeTypeEnum } from '../../../application/models/attribute-type.enum';
import { CriteriaConditionTypeModel } from '../../models/criteria-condition-type.model';
import * as moment from 'moment';
import { AttributeTypeHelper } from '../../../application/helpers/attribute-type.helper';

type AttributeSource = Omit<AnalysisSourceModel, 'geometryType'>;

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
  private allAttributes: Attribute[];

  private availableAttributesSubject$ = new BehaviorSubject<Attribute[]>([]);
  public filteredAttributes$: Observable<Attribute[]>;

  private filteredConditionsSubject$ = new BehaviorSubject<CriteriaConditionTypeModel[]>([]);
  public filteredConditions$ = this.filteredConditionsSubject$.asObservable();

  public criteriaForm = this.fb.group({
    source: [''],
    attribute: [''],
    condition: [''],
    value: [''],
  });

  private formData: Omit<CriteriaConditionModel, 'id'> = {}

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
        const source = +(formValues.source);
        const availableAttributes = this.availableAttributesSubject$.getValue();
        const attribute = availableAttributes.find(a => a.name === formValues.attribute);
        const attributeType = AttributeTypeHelper.getAdministrativeAttributeType(attribute);
        if (this.formData.source !== source) {
          this.availableAttributesSubject$.next(this.getAttributesForFeatureType(source));
        }
        if (this.formData.attributeType !== attributeType) {
          this.filteredConditionsSubject$.next(this.getConditionsForAttributeType(attributeType));
        }
        this.formData = {
          source,
          attribute: attribute ? attribute.name : undefined,
          attributeType,
          condition: formValues.condition,
          value: formValues.value,
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
        this.setupFormValues(selectedDataSource, layerMetadata);
        this.setInitialValues();
      });

    this.filteredAttributes$ = combineLatest([
      this.availableAttributesSubject$.asObservable(),
      this.criteriaForm.get('attribute').valueChanges.pipe(startWith('')),
    ]).pipe(
      takeUntil(this.destroyed),
      map(([ availableAttributes, value ]) => {
        const filterValue = value.toLowerCase();
        return availableAttributes.filter(attribute => attribute.name.toLowerCase().indexOf(filterValue) !== -1);
      }),
    );
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public getAttributeName(attribute: Attribute) {
    if (attribute) {
      return attribute.name;
    }
    return '';
  }

  private setupFormValues(selectedDataSource: AnalysisSourceModel, layerMetadata: AttributeMetadataResponse) {
    const relationSources = layerMetadata.relations.map<AttributeSource>(relation => ({
      featureType: relation.foreignFeatureType,
      label: `${relation.foreignFeatureTypeName}`,
      disabled: true,
    }));
    this.availableSources = [
      {featureType: selectedDataSource.featureType, label: selectedDataSource.label},
      ...relationSources,
    ];
    this.allAttributes = layerMetadata.attributes;
  }

  private setInitialValues() {
    const initialCriteria = { ...this.criteria };

    if (!initialCriteria.source && this.availableSources.length > 0 && !this.criteria.attribute) {
      initialCriteria.source = this.availableSources[0].featureType;
    }

    if (this.criteria.attributeType) {
      this.filteredConditionsSubject$.next(this.getConditionsForAttributeType(this.criteria.attributeType));
    }

    if (initialCriteria.source) {
      this.availableAttributesSubject$.next(this.getAttributesForFeatureType(initialCriteria.source));
    }

    let value: string | moment.Moment = this.criteria.value;
    if (value && this.criteria.attributeType === AttributeTypeEnum.DATE) {
      value = moment(value);
    }

    this.criteriaForm.patchValue({
      ...initialCriteria,
      value,
    });
  }

  private getAttributesForFeatureType(selectedSource: string | number) {
    return this.allAttributes.filter(attribute => {
      return attribute.featureType === +(selectedSource)
        && typeof AttributeTypeHelper.getAdministrativeAttributeType(attribute) !== 'undefined';
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

}
