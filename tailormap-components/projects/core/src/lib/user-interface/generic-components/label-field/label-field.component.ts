import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { FormFieldHelpers } from '../../../feature-form/form-field/form-field-helpers';

@Component({
  selector: 'tailormap-label-field',
  templateUrl: './label-field.component.html',
  styleUrls: ['./label-field.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelFieldComponent extends BaseFieldComponent implements OnInit {

  @Input()
  public valueTrue: boolean;

  constructor() {
    super();
  }

  public ngOnInit(): void {
  }

  public getLink() {
    if (typeof this.value === 'string' && !/^http/.test(this.value)) {
      return `//${this.value}`;
    }
    return this.value;
  }

  public hasDisplayValue() {
    return !FormFieldHelpers.isEmptyAttributeValue(this.value);
  }

}
