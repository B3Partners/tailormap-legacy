import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Attribute, FeatureAttribute, FormFieldType } from '../../shared/wegvakken-models';

@Component({
  selector: 'flamingo-wegvak-formfield',
  templateUrl: './wegvak-formfield.component.html',
  styleUrls: ['./wegvak-formfield.component.css'],
})
export class WegvakFormfieldComponent {

  @Input()
  public attribute: Attribute;

  @Input()
  public form: FormGroup;

  @Input()
  public featureAttribute: FeatureAttribute;

  @Input()
  public groep: FormGroup;

  @Input()
  public isBulk: boolean;

  @Input()
  public lookup: Map<string, string>;

  constructor() { }


  public isTextAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.TEXTFIELD;
  public isSelectAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.SELECT;
  public isHiddenAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.HIDDEN;
}
