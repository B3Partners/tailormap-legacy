import { Injectable } from '@angular/core';
import {
  Attribute,
  FeatureAttribute,
} from '../../form/form-models';
import {
  Attribuut,
  Domeinwaarde,
} from '../../../shared/generated';

@Injectable({
  providedIn: 'root',
})
export class LinkedAttributeRegistryService {

  private linkedAttributes: { [key: number]: Attribuut };
  private domainToAttribute: Map<number, FeatureAttribute>;

  private valueToParentValue: Map<number, Domeinwaarde>;

  private registry: Map<number, Attribuut>;

  constructor() {
    this.registry = new Map();
    this.domainToAttribute = new Map();
    this.valueToParentValue = new Map();
  }

  public setLinkedAttributes(linkedAttributes: Array<Attribuut>) {
    this.linkedAttributes = {};
    linkedAttributes.forEach(attribuut => {
      this.linkedAttributes[attribuut.id] = attribuut;
      attribuut.domein.waardes.forEach(domeinWaarde => {
        domeinWaarde.linkedDomeinwaardes.forEach(childWaarde => {
          this.valueToParentValue.set(childWaarde.id, domeinWaarde);
        });
      });
    })
  }

  public registerDomainField(attributeId: number, field: FeatureAttribute) {
    const attribuut = this.linkedAttributes[attributeId];
    this.registry.set(attributeId, attribuut);
    this.domainToAttribute.set(attribuut.domein.id, field);
  }

  public domainFieldChanged(attribuut: Attribute, value: any) {
    const linkedAttribute: Attribuut = this.registry.get(attribuut.linkedList);
    const options = {};
    let selectedValue: Domeinwaarde;

    // retrieve the selected value
    for (const key in linkedAttribute.domein.waardes) {
      const val = linkedAttribute.domein.waardes[key]
      if (val.id == value) {
        selectedValue = val;
        break;
      }
    }
    if (selectedValue) {
      // retrieve all childvalues for the selected value

      selectedValue.linkedDomeinwaardes.forEach(domeinWaarde => {
        if (!options.hasOwnProperty(domeinWaarde.domein_id)) {
          options[domeinWaarde.domein_id] = [];
        }
        options[domeinWaarde.domein_id].push({
          label: domeinWaarde.synoniem || domeinWaarde.waarde,
          val: domeinWaarde.id,
        });
      });
    } else {
      this.resetLinkedDomains(linkedAttribute);
    }

    // set all the fields to the new values
    for (const domainId in options) {
      const attr = this.domainToAttribute.get(parseInt(domainId, 10));
      if (attr) {
        const selectedOptions = options[domainId];
        attr.options.forEach(option => {
          option.disabled = true;
          for (const selectedOption of selectedOptions) {
            if (selectedOption.val === option.val) {
              option.disabled = false;
            }
          }
        });
      }
    }

    // check if the changed value has a parent. If so, select the associated value
    if (selectedValue && this.valueToParentValue.has(selectedValue.id)) {
      const parentValue = this.valueToParentValue.get(selectedValue.id);
      const parentAttribute = this.domainToAttribute.get(parentValue.domein_id);
      parentAttribute.value = parentValue.id;
    }
  }

  public resetLinkedAttributes() {
    this.registry.forEach(attribuut => {
      this.resetLinkedDomains(attribuut);
    });
  }

  private resetLinkedDomains(linkedAttribute: Attribuut) {
    linkedAttribute.domein.waardes.forEach(value => {
      for (const domeinWaarde of value.linkedDomeinwaardes) {
        const attr = this.domainToAttribute.get(domeinWaarde.domein_id);
        if (attr) {
          attr.options.forEach(option => {
            option.disabled = false;
          });
        }
      }
    });
  }
}
