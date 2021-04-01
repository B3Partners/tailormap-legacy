import { Component, OnInit } from '@angular/core';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { FormFieldType } from '../../../feature-form/form/form-models';

@Component({
  selector: 'tailormap-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.css'],
})
export class InputFieldComponent extends BaseFieldComponent implements OnInit {

  constructor() {
    super();
  }


  public ngOnInit(): void {
  }

  public getInputType() {
    return this.fieldType === FormFieldType.HYPERLINK ? 'url' : 'text';
  }

}
