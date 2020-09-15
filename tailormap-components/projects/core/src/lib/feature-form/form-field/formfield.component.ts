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
    if (this.hasNonValidValue()) {
      // this.control.setValidators([this.forbiddenNameValidator]);
     // this.control.setErrors({incorrect: true});
    }else {
      const comparableValue = this.getComparableValue();
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

  public hasNonValidValue(): boolean {
    if (this.attribute.value && (!this.attribute.options || this.attribute.options.length === 0)) {
      return true;
    } else {
      if (this.attribute.options && this.attribute.options?.length !== 0 &&
        this.attribute.options.findIndex(value => {
          const attributeValue = this.attribute.value;
          return (!this.isNumber(attributeValue) && attributeValue === value.label)
            || (this.isNumber(attributeValue) && value.val === parseInt( '' + attributeValue, 10));
        }) === -1) {
        return true;
      }
    }
    return false;
  }

  private isNumber(n): boolean {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  private getComparableValue() : SelectOption {
    if (this.attribute.options && this.attribute.options?.length !== 0 ) {
      const ret = this.attribute.options.find(value => {
        const attributeValue = this.attribute.value;
        return (!this.isNumber(attributeValue) && attributeValue === value.label)
          || (this.isNumber(attributeValue) && value.val === parseInt( '' + attributeValue, 10));
      });
      return ret;
    }
  }


  public isTextAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.TEXTFIELD;
  public isSelectAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.SELECT;
  public isHiddenAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.HIDDEN;
  public isDomainAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.DOMAIN;
}
