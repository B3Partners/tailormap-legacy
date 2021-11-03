import { Component, Inject, Input, OnInit } from '@angular/core';
import * as momentNs from 'moment';
import { FeatureAttribute } from '../../../feature-form/form/form-models';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'tailormap-datepicker-field',
  templateUrl: './datepicker-field.component.html',
  styleUrls: ['./datepicker-field.component.css'],
})
export class DatepickerFieldComponent implements OnInit {

  @Input()
  public groep: FormGroup;

  @Input()
  public attribute: FeatureAttribute;

  constructor(
    @Inject(MAT_DATE_FORMATS) private dateFormats,
  ) {}

  public ngOnInit(): void {
    this.dateFormats.display.dateInput = this.getDateFormat();
  }

  public getDate(): Date {
    if (!this.attribute.value) {
      return null;
    }
    return new Date(this.attribute.value.toString());
  }

  public changeDate(date: MatDatepickerInputEvent<momentNs.Moment>) {
    this.attribute.value = date.value.toDate().toString();
    const formattedDate = date.value.format(this.getDateFormat());
    this.groep.get(this.attribute.key).setValue(formattedDate, {
      emitEvent: true,
      onlySelf: false,
      emitModelToViewChange: true,
      emitViewToModelChange: true,
    });
    this.groep.get(this.attribute.key).markAsDirty({ onlySelf: true });
  }

  private getDateFormat() {
    return this.attribute.dateFormat || 'YYYY-MM-DD';
  }

  public isDisabled() {
    return this.attribute.isReadOnly;
  }

}
