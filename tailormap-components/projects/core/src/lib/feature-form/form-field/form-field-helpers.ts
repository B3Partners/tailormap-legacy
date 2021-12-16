import { Attribute, FeatureAttribute, FormFieldType, SelectOption } from '../form/form-models';
import { AbstractControl, ValidatorFn } from '@angular/forms';

export class FormFieldHelpers {

  private static MULTI_SELECT_SEPARATOR = ';';

  public static nonExistingValueValidator(attribute: FeatureAttribute): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      return FormFieldHelpers.hasNonValidValue({ ...attribute, value: control.value }, true)
        ? { nonExistingValue: { value: control.value }}
        : null;
    };
  }

  public static hasNonValidValue(attribute: FeatureAttribute, allowValueFormEmptyOptions?: boolean): boolean {
    if (attribute.type !== FormFieldType.DOMAIN && attribute.type !== FormFieldType.SELECT) {
      return false;
    }
    if (attribute.value && (!attribute.options || attribute.options.length === 0)) {
      return allowValueFormEmptyOptions ? false : true;
    }
    if (attribute.options && attribute.options?.length !== 0) {
      const domainValue = FormFieldHelpers.findSelectedOption(attribute.options, attribute.value);
      return Array.isArray(domainValue) ? domainValue.length === 0 : !domainValue;
    }
    return false;
  }

  public static isNumber(n): boolean {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  public static isMultiSelectAttribute = (attr: Attribute): boolean => attr.multiSelect;

  public static getAttributeControlValue(control: AbstractControl) {
    const value = typeof control.value === 'undefined' ? '' : control.value;
    if (Array.isArray(value)) {
      return value.join(FormFieldHelpers.MULTI_SELECT_SEPARATOR);
    }
    return value;
  }

  public static getAttributeValue(attribute: FeatureAttribute): (string | number)[] | string | number {
    let value: (string | number)[] | string | number = attribute
      ? attribute.value
      : null;
    if (FormFieldHelpers.isMultiSelectAttribute(attribute)
      && !Array.isArray(value) && typeof value === 'string') {
      value = value.split(FormFieldHelpers.MULTI_SELECT_SEPARATOR);
    }
    if (attribute.type === FormFieldType.DOMAIN) {
      const compVal = FormFieldHelpers.findSelectedOption(attribute.options, value);
      value = typeof compVal !== 'undefined' && compVal !== null
        ? (Array.isArray(compVal) ? compVal.map(c => c.val) : compVal.val)
        : value;
    }
    return value;
  }

  public static isEmptyAttributeValue(value: (string | number)[] | string | number): boolean {
    return (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'string' && value === '') ||
      (typeof value === 'number' && value === -1);
  }

  public static findSelectedOption(options: SelectOption[], attributeValue: string | number | (number | string)[]): SelectOption | SelectOption[] | undefined {
    if (options && options?.length !== 0 ) {
      if (Array.isArray(attributeValue)) {
        return attributeValue.map(value => FormFieldHelpers.findSelectedOptionForValue(options, value))
          .filter(value => typeof value !== 'undefined');
      }
      return FormFieldHelpers.findSelectedOptionForValue(options, attributeValue);
    }
    return undefined;
  }

  private static findSelectedOptionForValue(options: SelectOption[], attributeValue: string | number): SelectOption | undefined {
    return options.find(value => {
      const isNumberValue = FormFieldHelpers.isNumber(attributeValue);
      return (attributeValue === value.val)
        || (isNumberValue && +(value.val) === +(attributeValue))
        || (isNumberValue && value.id === +(attributeValue));
    });
  }

}
