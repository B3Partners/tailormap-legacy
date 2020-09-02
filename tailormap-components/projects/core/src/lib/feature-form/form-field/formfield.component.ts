import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {Attribute, FeatureAttribute, FormFieldType} from "../form/form-models";
import {LinkedAttributeRegistryService} from "../linked-fields/registry/linked-attribute-registry.service";

@Component({
  selector: 'flamingo-formfield',
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


  constructor(
    private registry: LinkedAttributeRegistryService,
    ) {

  }

  public valueChanged(event : any):void{
    if(this.isDomainAttribute(this.attribute)){
      this.registry.domainFieldChanged(this.attribute, event.value);
    }
  }

  public isTextAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.TEXTFIELD;
  public isSelectAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.SELECT;
  public isHiddenAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.HIDDEN;
  public isDomainAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.DOMAIN;
}
