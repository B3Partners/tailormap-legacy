import { Injectable } from '@angular/core';
import {Attribute} from "../../../feature-form/form/form-models";
import {Attribuut, LinkedAttribute} from "../../generated";
import {DomainRepositoryService} from "../domain-repository/domain-repository.service";

@Injectable({
  providedIn: 'root'
})
export class LinkedAttributeRegistryService {

  private linkedAttributes:  { [key: string]: LinkedAttribute };
  private domainToAttribute: Map<number, Attribute>;

  private registry: Map<number, LinkedAttribute>;
  constructor(
  ) {
    this.registry = new Map();
    this.domainToAttribute = new Map();
  }

  public setLinkedAttributes(linkedAttributes : { [key: string]: LinkedAttribute }){
    this.linkedAttributes = linkedAttributes;
  }


  public registerDomainField(linkedAttributeId: number, linkedAttribute: LinkedAttribute, field: Attribute){
    this.registry.set(linkedAttributeId, linkedAttribute);
    this.domainToAttribute.set(linkedAttribute.domein_id, field);
  }

  public domainFieldChanged(attribuut: Attribute, value: any){
    const linkedAttribute : LinkedAttribute = this.registry.get(attribuut.linkedList);
    const options = {};
    const linkedValues = linkedAttribute.linked_values[value];

    for(let lVal of linkedValues ) {
      const b =0;
      if(!options.hasOwnProperty(lVal.domeinchildid)){
        options[lVal.domeinchildid] = [];
      }
      options[lVal.domeinchildid].push({
        label: lVal.value,
        val: lVal.value,
      });
    }
    for (let domainId in options) {
      this.domainToAttribute.get(parseInt(domainId)).options = options[domainId];
    }
    //attribuut.options = options;
    const a = 0;
  }
}
