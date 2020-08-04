import { Injectable } from '@angular/core';
import {Attribute} from "../../../feature-form/form/form-models";
import {Attribuut, LinkedAttribute} from "../../generated";
import {DomainRepositoryService} from "../domain-repository/domain-repository.service";

@Injectable({
  providedIn: 'root'
})
export class LinkedAttributeRegistryService {

  private linkedAttributes:  { [key: string]: LinkedAttribute };

  private registry: Map<number, LinkedAttribute>;
  constructor(
  ) {
    this.registry = new Map();
  }

  public setLinkedAttributes(linkedAttributes : { [key: string]: LinkedAttribute }){
    this.linkedAttributes = linkedAttributes;
  }


  public registerDomainField(linkedAttributeId: number, linkedAttribute: LinkedAttribute){
    this.registry.set(linkedAttributeId, linkedAttribute);
  }

  public domainFieldChanged(attribuut: Attribute, value: any){
    const linkedAttribute : LinkedAttribute = this.registry.get(attribuut.linkedList);
    const options = [];
    const linkedValues = linkedAttribute.linked_values[value];
    for(let lVal of linkedValues ) {
      const b =0;

      options.push({
        label: lVal.value,
        val: lVal.value,
      });
    }
    attribuut.options = options;
    const a = 0;
  }
}
