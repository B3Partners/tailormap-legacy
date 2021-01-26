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


  public static nonExistingValueValidator(attribute : FeatureAttribute): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      return FormFieldHelpers.hasNonValidValue(attribute) ? {invalidValue: {value: control.value}} : null;
    };
  }

  public static hasNonValidValue(attribute : FeatureAttribute): boolean {
    if (attribute.type !== FormFieldType.DOMAIN && attribute.type !== FormFieldType.SELECT) {
      return false;
    }
    if (attribute.value && (!attribute.options || attribute.options.length === 0)) {
      return true;
    } else {
      if (attribute.options && attribute.options?.length !== 0 &&
        attribute.options.findIndex(value => {
          const attributeValue = attribute.value;
          return (!FormFieldHelpers.isNumber(attributeValue) && attributeValue === value.label)
            || (FormFieldHelpers.isNumber(attributeValue) && value.val === parseInt( '' + attributeValue, 10));
        }) === -1) {
        return true;
      }
    }
    return false;
  }

  public static isNumber(n): boolean {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  public static getComparableValue(attribute : FeatureAttribute) : SelectOption {
    if (attribute.options && attribute.options?.length !== 0 ) {
      const ret = attribute.options.find(value => {
        const attributeValue = attribute.value;
        return (!FormFieldHelpers.isNumber(attributeValue) && attributeValue === value.label)
          || (FormFieldHelpers.isNumber(attributeValue) && value.val === parseInt( '' + attributeValue, 10));
      });
      return ret;
    }
  }
}
