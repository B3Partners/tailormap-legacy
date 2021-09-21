import {
  FeatureAttribute,
  FormFieldType,
  SelectOption,
} from '../form/form-models';
import {
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';

export class FormFieldHelpers {


  public static nonExistingValueValidator(attribute: FeatureAttribute): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      return FormFieldHelpers.hasNonValidValue(attribute) ? {invalidValue: {value: control.value}} : null;
    };
  }

  public static hasNonValidValue(attribute: FeatureAttribute): boolean {
    if (attribute.type !== FormFieldType.DOMAIN && attribute.type !== FormFieldType.SELECT) {
      return false;
    }
    if (attribute.value && (!attribute.options || attribute.options.length === 0)) {
      return true;
    } else {
      if (attribute.options && attribute.options?.length !== 0) {
        const optionValue = FormFieldHelpers.getComparableValue(attribute);
        return !!optionValue;
      }
    }
    return false;
  }

  public static isNumber(n): boolean {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  public static getComparableValue(attribute: FeatureAttribute): SelectOption | undefined {
    if (attribute.options && attribute.options?.length !== 0 ) {
      return attribute.options.find(value => {
        const attributeValue = attribute.value;
        const isNumberValue = FormFieldHelpers.isNumber(attributeValue);
        return (attributeValue === value.val)
          || (isNumberValue && +(value.val) === +(attributeValue))
          || (isNumberValue && value.id === +(attributeValue));
      });
    }
    return undefined;
  }

}
