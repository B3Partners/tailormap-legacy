import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormFieldType } from '../../../feature-form/form/form-models';
import { FormFieldHelpers } from '../../../feature-form/form-field/form-field-helpers';

@Component({
  selector: 'tailormap-base-field',
  templateUrl: './base-field.component.html',
  styleUrls: ['./base-field.component.css'],
})
export class BaseFieldComponent implements OnInit {
  @Input()
  public id: string;

  @Input()
  public label: string;

  @Input()
  public placeholder: string;

  @Input()
  public value: string | number | (string | number)[];

  @Input()
  public groep: FormGroup;

  @Input()
  public hidden: boolean;

  @Input()
  public fieldType: FormFieldType;

  constructor() { }

  public ngOnInit(): void {
  }

  public isHyperlinkField() {
    return this.fieldType === FormFieldType.HYPERLINK;
  }

  public isCheckboxField() {
    return this.fieldType === FormFieldType.CHECKBOX;
  }

  public getValue() {
    if (Array.isArray(this.value)) {
      return this.value.join(', ');
    }
    return this.value;
  }

}
