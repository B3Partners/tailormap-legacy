import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {Attribute, FeatureAttribute, FormFieldType} from "../form/form-models";

@Component({
  selector: 'flamingo-wegvak-formfield',
  templateUrl: './formfield.component.html',
  styleUrls: ['./formfield.component.css'],
})
export class FormfieldComponent {

  @Input()
  public attribute: FeatureAttribute;

  @Input()
  public form: FormGroup;

  @Input()
  public value: string;

  @Input()
  public groep: FormGroup;

  @Input()
  public isBulk: boolean;


  constructor() {
    const a=0;
  }


  public isTextAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.TEXTFIELD;
  public isSelectAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.SELECT;
  public isHiddenAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.HIDDEN;
}
