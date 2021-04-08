import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AttributeFilterTypeModel } from '../models/attribute-filter-type.model';
import { AttributeTypeEnum } from '../models/attribute-type.enum';
import { FormArray, FormBuilder } from '@angular/forms';
import { debounceTime, map, take, takeUntil } from 'rxjs/operators';
import { CriteriaHelper } from '../../analysis/criteria/helpers/criteria.helper';
import * as moment from 'moment';

type FilterData = { condition?: string; value?: string | string[] };

interface FilterFormData {
  condition: string;
  value: string;
  values: string[];
}

@Component({
  selector: 'tailormap-attribute-filter',
  templateUrl: './attribute-filter.component.html',
  styleUrls: ['./attribute-filter.component.css'],
})
export class AttributeFilterComponent implements OnInit, OnDestroy {

  @Input()
  public set attributeType(attributeType: AttributeTypeEnum) {
    this._attributeType = attributeType;
    this.setDisabledState();
    this.updateConditions();
  }

  @Input()
  public set filter(filter: { condition?: string; value?: string | string[] | moment.Moment }) {
    if (filter.value && this._attributeType === AttributeTypeEnum.DATE) {
      filter.value = moment(filter.value);
    }
    this.attributeFilterForm.patchValue(filter, { emitEvent: false });
  }

  @Input()
  public set uniqueValues$(uniqueValues$: Observable<string[]>) {
    this.uniqueValuesLoader$ = uniqueValues$;
    this.hasUniqueValues = !!uniqueValues$;
    this.updateConditions();
  }

  @Output()
  public filterChanged: EventEmitter<{ condition: string; value: string | string[] }> = new EventEmitter<{condition: string; value: string | string[] }>();

  private hasUniqueValues: boolean;
  private uniqueValuesLoader$: Observable<string[]>;
  public loadingUniqueValues = false;
  public uniqueValues: string[];

  public attributeFilterForm = this.fb.group({
    condition: [''],
    value: [''],
    values: this.fb.array([]),
  });

  private _attributeType: AttributeTypeEnum;

  private destroyed = new Subject();

  private filteredConditionsSubject$ = new BehaviorSubject<AttributeFilterTypeModel[]>([]);
  public filteredConditions$ = this.filteredConditionsSubject$.asObservable();

  private formValues: FilterData = {};

  constructor(
    private fb: FormBuilder,
  ) { }

  public ngOnInit(): void {
    this.attributeFilterForm.valueChanges
      .pipe(
        takeUntil(this.destroyed),
        debounceTime(250),
        map<FilterFormData, FilterData>(formValues => {
          let value: string | string[] = formValues.value;
          if (value && this._attributeType === AttributeTypeEnum.DATE && moment.isMoment(value)) {
            value = value.toISOString();
          }
          if (this.hasUniqueValues && this.formValues.condition !== formValues.condition && formValues.condition === CriteriaHelper.UNIQUE_VALUES_KEY) {
            this.initUniqueValues();
          }
          if (formValues.condition === CriteriaHelper.UNIQUE_VALUES_KEY) {
            value = formValues.values || [];
          }
          return { condition: formValues.condition, value };
        }),
      )
      .subscribe(formValues => {
        this.formValues = { condition: formValues.condition, value: formValues.value };
        this.filterChanged.emit({ condition: formValues.condition, value: formValues.value });
      });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private initUniqueValues() {
    this.loadingUniqueValues = true;
    this.uniqueValuesLoader$.pipe(take(1)).subscribe(uniqueValues => {
      const selectedItems = this.filter.value && Array.isArray(this.filter.value) ? new Set(this.filter.value) : new Set();
      const valuesForm = this.values;
      this.uniqueValues = uniqueValues;
      uniqueValues.forEach(value => {
        valuesForm.push(this.fb.control(selectedItems.has(value) ? value : ''));
      });
      this.loadingUniqueValues = false;
    });
  }

  public get values(): FormArray {
    return this.attributeFilterForm.get('values') as FormArray;
  }

  public showValueInput() {
    return this._attributeType === AttributeTypeEnum.STRING || this._attributeType === AttributeTypeEnum.NUMBER;
  }

  public showDateInput() {
    return this._attributeType === AttributeTypeEnum.DATE;
  }

  public showUniqueValuesInput() {
    return this.formValues.condition === CriteriaHelper.UNIQUE_VALUES_KEY;
  }

  public setDisabledState() {
    if (!!this._attributeType) {
      this.attributeFilterForm.controls.condition.enable({ emitEvent: false });
      this.attributeFilterForm.controls.value.enable({ emitEvent: false });
    } else {
      this.attributeFilterForm.controls.condition.disable({ emitEvent: false });
      this.attributeFilterForm.controls.value.disable({ emitEvent: false });
    }
  }

  private updateConditions() {
    const conditions = CriteriaHelper.getConditionTypes(this.hasUniqueValues).filter(c => !c.attributeType || c.attributeType === this._attributeType);
    this.filteredConditionsSubject$.next(conditions);
  }

}
