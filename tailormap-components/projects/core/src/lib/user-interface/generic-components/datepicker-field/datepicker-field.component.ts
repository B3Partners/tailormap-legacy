import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { FeatureAttribute } from '../../../feature-form/form/form-models';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS } from '@angular/material/core';

@Component({
  selector: 'tailormap-datepicker-field',
  templateUrl: './datepicker-field.component.html',
  styleUrls: ['./datepicker-field.component.css'],
})
export class DatepickerFieldComponent extends BaseFieldComponent implements OnInit {

  @Input()
  public attribute: FeatureAttribute;

  @Output()
  public dateChange: EventEmitter< MatDatepickerInputEvent< any>>;

  constructor(@Inject(MAT_DATE_FORMATS) private dateFormats) {super(); }

  public ngOnInit(): void {
    this.dateFormats.display.dateInput = this.attribute.dateFormat;
  }

  public getDate(): Date {
    return new Date(this.attribute.value.toString());
  }

  public changeDate(date: any) {
    this.attribute.value = new Date(date.value._d).toString();
    this.groep.get(this.attribute.key).setValue(new Date(date.value._d), {
      emitEvent: true,
      onlySelf: false,
      emitModelToViewChange: true,
      emitViewToModelChange: true,
    });
  }

}
