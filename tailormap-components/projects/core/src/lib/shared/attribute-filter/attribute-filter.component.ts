import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AttributeFilterTypeModel } from '../models/attribute-filter-type.model';
import { AttributeTypeEnum } from '../models/attribute-type.enum';
import { FormBuilder } from '@angular/forms';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { CriteriaHelper } from '../../analysis/criteria/helpers/criteria.helper';
import * as moment from 'moment';

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
  public set filter(filter: { condition?: string; value?: string | moment.Moment }) {
    if (filter.value && this._attributeType === AttributeTypeEnum.DATE) {
      filter.value = moment(filter.value);
    }
    this.attributeFilterForm.patchValue(filter, { emitEvent: false });
  }

  @Output()
  public filterChanged: EventEmitter<{ condition: string; value: string }> = new EventEmitter<{condition: string; value: string}>();

  public attributeFilterForm = this.fb.group({
    condition: [''],
    value: [''],
  });

  private _attributeType: AttributeTypeEnum;

  private destroyed = new Subject();

  private filteredConditionsSubject$ = new BehaviorSubject<AttributeFilterTypeModel[]>([]);
  public filteredConditions$ = this.filteredConditionsSubject$.asObservable();

  constructor(
    private fb: FormBuilder,
  ) { }

  public ngOnInit(): void {
    this.attributeFilterForm.valueChanges
      .pipe(
        takeUntil(this.destroyed),
        debounceTime(250),
        map(formValues => {
          let value: string = formValues.value;
          if (value && this._attributeType === AttributeTypeEnum.DATE && moment.isMoment(value)) {
            value = value.toISOString();
          }
          return { condition: formValues.condition, value };
        }),
      )
      .subscribe(formValues => {
        this.filterChanged.emit({ condition: formValues.condition, value: formValues.value });
      });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public showValueInput() {
    return this._attributeType === AttributeTypeEnum.STRING || this._attributeType === AttributeTypeEnum.NUMBER;
  }

  public showDateInput() {
    return this._attributeType === AttributeTypeEnum.DATE;
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
    const conditions = CriteriaHelper.getConditionTypes().filter(c => c.attributeType === this._attributeType);
    this.filteredConditionsSubject$.next(conditions);
  }

}
