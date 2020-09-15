import {
  AfterContentInit,
  AfterViewInit,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import {
  Attribute,
  FeatureAttribute,
  FormFieldType,
  SelectOption,
} from '../form/form-models';
import { LinkedAttributeRegistryService } from '../linked-fields/registry/linked-attribute-registry.service';
import { FormFieldHelpers } from './form-field-helpers';

@Component({
  selector: 'tailormap-formfield',
  templateUrl: './formfield.component.html',
  styleUrls: ['./formfield.component.css'],
})
export class FormfieldComponent implements AfterViewInit {

  @Input()
  public attribute: FeatureAttribute;

  @Input()
  public value: string;

  @Input()
  public groep: FormGroup;

  @Input()
  public isBulk: boolean;

  private control: AbstractControl;

  constructor(
    private registry: LinkedAttributeRegistryService,
  ) {
  }


  public ngAfterViewInit(): void {
    this.control = this.groep.controls[this.attribute.key];
    if (FormFieldHelpers.hasNonValidValue(this.attribute)) {
       this.control.setValidators([FormFieldHelpers.nonExistingValueValidator(this.attribute)]);
    }else {
      const comparableValue = FormFieldHelpers.getComparableValue(this.attribute);
      if (comparableValue) {
        const val = comparableValue.val;
        this.control.setValue(val, {
          emitEvent: false,
          onlySelf: false,
          emitModelToViewChange: false,
          emitViewToModelChange: false,
        });
      }
    }
  }

  public valueChanged(event: any): void {
    if (this.isDomainAttribute(this.attribute)) {
      this.registry.domainFieldChanged(this.attribute, event.value);
    }
  }

  public hasNonValidValue() : boolean {
    return FormFieldHelpers.hasNonValidValue(this.attribute);
  }

  public isTextAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.TEXTFIELD;
  public isSelectAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.SELECT;
  public isHiddenAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.HIDDEN;
  public isDomainAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.DOMAIN;
}
