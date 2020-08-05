import { Injectable } from '@angular/core';
import {Attribute, FeatureAttribute} from "../../../feature-form/form/form-models";
import { LinkedAttribute, LinkedValue} from "../../generated";

@Injectable({
  providedIn: 'root'
})
export class LinkedAttributeRegistryService {

  private linkedAttributes:  { [key: string]: LinkedAttribute };
  private domainToAttribute: Map<number, FeatureAttribute>;

  private registry: Map<number, LinkedAttribute>;
  constructor(
  ) {
    this.registry = new Map();
    this.domainToAttribute = new Map();
  }

  public setLinkedAttributes(linkedAttributes : { [key: string]: LinkedAttribute }){
    this.linkedAttributes = linkedAttributes;
  }


  public registerDomainField(linkedAttributeId: number, field: FeatureAttribute){
    const linkedAttribute = this.linkedAttributes[linkedAttributeId];
    this.registry.set(linkedAttributeId, linkedAttribute);
    this.domainToAttribute.set(linkedAttribute.domein_id, field);
  }

  public domainFieldChanged(attribuut: Attribute, value: any){
    const linkedAttribute : LinkedAttribute = this.registry.get(attribuut.linkedList);
    const options = {};
    let selectedValue : LinkedValue;

    // retrieve the selected value
    for(let val of linkedAttribute.values){
      if(val.id === value){
        selectedValue = val;
        break;
      }
    }

    // retrieve all childvalue for the selected value
    for(let domainId in selectedValue.child_domain_values){
      const childValues : LinkedValue[] = selectedValue.child_domain_values[domainId];
      // for all different domains related to the selected value, retrieve the childvalues
      for(let childValue of childValues){
          if(!options.hasOwnProperty(childValue.domeinid)){
            options[childValue.domeinid] = [];
          }
          options[childValue.domeinid].push({
            label: childValue.value,
            val: childValue.id,
          });
      }
    }

    // set all the fields to the new values
    for (let domainId in options) {
      let attr = this.domainToAttribute.get(parseInt(domainId));
      if(attr){
        attr.options = options[domainId];
      }
    }

    // check if the changed value has a parent. If so, select the associated value
    if(selectedValue.parentdomeinid){
      const parentAttribute = this.domainToAttribute.get(selectedValue.parentdomeinid);
      const parentValue : LinkedValue = selectedValue.parent_value;
      parentAttribute.value = parentValue.id;
    }
  }
}
