import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AttributeFilterTypeModel } from '../models/attribute-filter-type.model';
import { AttributeTypeEnum } from '../models/attribute-type.enum';
import { FormBuilder } from '@angular/forms';
import { debounceTime, map, take, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { AttributeFilterHelper } from '../helpers/attribute-filter.helper';

type FilterData = { condition?: string; value?: string[] };

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
  public set filter(filter: { condition?: string; value?: Array<string | moment.Moment> }) {
    let value: string | moment.Moment = '';
    if (filter.value && filter.value.length === 1 && this._attributeType === AttributeTypeEnum.DATE) {
      value = moment(filter.value[0]);
    } else if (filter.value && filter.value.length === 1) {
      value = filter.value[0];
    }
    this.attributeFilterForm.patchValue({ condition: filter.condition, value }, { emitEvent: false });
    if (this.formValues && this.formValues.condition !== filter.condition && filter.condition === AttributeFilterHelper.UNIQUE_VALUES_KEY) {
      this.initUniqueValues();
    }
    this.formValues = { condition: filter.condition, value: !!filter.value ? filter.value.map(val => this.mapValueToString(val)) : [] };
  }

  @Input()
  public set uniqueValues$(uniqueValues$: Observable<string[]>) {
    this.uniqueValuesLoader$ = uniqueValues$;
    this.hasUniqueValues = !!uniqueValues$;
    this.updateConditions();
    if (this.formValues && this.formValues.condition === AttributeFilterHelper.UNIQUE_VALUES_KEY) {
      this.initUniqueValues();
    }
  }

  @Output()
  public filterChanged: EventEmitter<{ condition: string; value: string[] }> = new EventEmitter<{condition: string; value: string[] }>();

  private hasUniqueValues: boolean;
  private uniqueValuesLoader$: Observable<string[]>;
  public loadingUniqueValues = false;
  private uniqueValuesLoaded = false;
  public uniqueValues: { value: string; selected: boolean }[];

  public allUniqueValuesSelected = false;
  public someUniqueValuesSelected = false;

  public attributeFilterForm = this.fb.group({
    condition: [''],
    value: [''],
  });

  private _attributeType: AttributeTypeEnum;

  private destroyed = new Subject();

  private filteredConditionsSubject$ = new BehaviorSubject<AttributeFilterTypeModel[]>([]);
  public filteredConditions$ = this.filteredConditionsSubject$.asObservable();

  private formValues: FilterData = {};
  public trackByIndex = (idx: number) => idx;

  constructor(
    private fb: FormBuilder,
  ) { }

  public ngOnInit(): void {
    this.attributeFilterForm.valueChanges
      .pipe(
        takeUntil(this.destroyed),
        debounceTime(250),
        map<FilterFormData, FilterData>(formValues => {
          let value = [ this.mapValueToString(formValues.value) ];
          if (this.formValues.condition !== formValues.condition && formValues.condition === AttributeFilterHelper.UNIQUE_VALUES_KEY) {
            this.initUniqueValues();
          }
          if (formValues.condition === AttributeFilterHelper.UNIQUE_VALUES_KEY) {
            value = this.getSelectedUniqueValues();
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

  private mapValueToString(inputValue: string | moment.Moment): string {
    if (inputValue && this._attributeType === AttributeTypeEnum.DATE && moment.isMoment(inputValue)) {
      return inputValue.toISOString();
    }
    if (typeof inputValue === 'string') {
      return inputValue;
    }
    return '';
  }

  private initUniqueValues() {
    if (this.loadingUniqueValues || this.uniqueValuesLoaded || !this.hasUniqueValues) {
      return;
    }
    this.loadingUniqueValues = true;
    this.uniqueValuesLoader$.pipe(take(1)).subscribe(uniqueValues => {
      const selectedItems = this.formValues && this.formValues.value && Array.isArray(this.formValues.value)
        ? new Set(this.formValues.value)
        : new Set();
      this.uniqueValues = uniqueValues.map(value => ({ value, selected: selectedItems.has(value) }));
      this.loadingUniqueValues = false;
      this.uniqueValuesLoaded = true;
      this.allUniqueValuesSelected = this.getAllUniqueValuesSelected();
      this.someUniqueValuesSelected = this.getSomeUniqueValuesSelected();
    });
  }

  private getAllUniqueValuesSelected() {
    return this.uniqueValues.every(v => v.selected);
  }

  private getSomeUniqueValuesSelected() {
    return this.uniqueValues.some(v => v.selected);
  }

  public toggleAllUniqueValues() {
    this.someUniqueValuesSelected = false;
    if (this.allUniqueValuesSelected) {
      this.allUniqueValuesSelected = false;
      this.uniqueValues = this.uniqueValues.map(v => ({ ...v, selected: false }));
    } else {
      this.allUniqueValuesSelected = true;
      this.uniqueValues = this.uniqueValues.map(v => ({ ...v, selected: true }));
    }
  }

  public showValueInput() {
    return !this.showUniqueValuesInput() && (this._attributeType === AttributeTypeEnum.STRING || this._attributeType === AttributeTypeEnum.NUMBER);
  }

  public showDateInput() {
    return !this.showUniqueValuesInput() && this._attributeType === AttributeTypeEnum.DATE;
  }

  public showUniqueValuesInput() {
    return this.formValues.condition === AttributeFilterHelper.UNIQUE_VALUES_KEY;
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
    const conditions = AttributeFilterHelper.getConditionTypes(this.hasUniqueValues).filter(c => !c.attributeType || c.attributeType === this._attributeType);
    this.filteredConditionsSubject$.next(conditions);
  }

  public toggleUniqueValue(uniqueValue: string) {
    this.uniqueValues = this.uniqueValues.map(u => {
      if (u.value === uniqueValue) {
        return { ...u, selected: !u.selected };
      }
      return u;
    });

    this.allUniqueValuesSelected = this.getAllUniqueValuesSelected();
    this.someUniqueValuesSelected = this.getSomeUniqueValuesSelected();

    if (this.formValues.condition === AttributeFilterHelper.UNIQUE_VALUES_KEY) {
      this.formValues.value = this.getSelectedUniqueValues();
      this.filterChanged.emit({ condition: this.formValues.condition, value: this.formValues.value });
    }
  }

  private getSelectedUniqueValues(): string[] {
    return (this.uniqueValues || []).filter(val => val.selected).map(val => val.value);
  }

}
