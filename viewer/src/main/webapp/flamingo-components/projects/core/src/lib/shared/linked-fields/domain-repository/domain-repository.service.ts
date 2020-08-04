import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {
  Attribute,
  FormConfiguration,
  FormConfigurations,
  FormFieldType,
  SelectOption
} from "../../../feature-form/form/form-models";
import { AttribuutControllerService, LinkedAttribute} from "../../generated";
import {LinkedAttributeRegistryService} from "../registry/linked-attribute-registry.service";

@Injectable({
  providedIn: 'root'
})
export class DomainRepositoryService {
  private formConfigs: FormConfigurations;
  private linkedAttributes:  { [key: string]: LinkedAttribute };

  constructor(
    private repo: AttribuutControllerService,
    private registry: LinkedAttributeRegistryService) {
  }

  public initFormConfig(formConfigs: FormConfigurations){
    this.formConfigs = formConfigs;
    const domainAttrs : number[] = [];
    for (let key in formConfigs.config) {
      if(formConfigs.config.hasOwnProperty(key)){
        let config = formConfigs.config[key];
        config.fields.forEach(attribute =>{
          if(attribute.type === FormFieldType.DOMAIN){
            domainAttrs.push(attribute.linkedList);
          }
        });
      }
    }


    this.repo.attributes(domainAttrs).subscribe(result=>{
      this.linkedAttributes = result;
      this.registry.setLinkedAttributes(this.linkedAttributes);
      for (let attributeId in this.linkedAttributes) {
        let linkedAttribute : LinkedAttribute = this.linkedAttributes[attributeId];
        let featureType = linkedAttribute.feature_type.toLowerCase();
        let fc : FormConfiguration = this.formConfigs.config[featureType];

        fc.fields.forEach(field => {
          if (field.linkedList && field.linkedList === parseInt(attributeId)){
            this.registry.registerDomainField(field.linkedList, linkedAttribute);
            const options = [];
            for(var value in linkedAttribute.linked_values) {
                options.push({
                  label: value,
                  val: value,
                });
            }
            field.options = options;
          }
        });
      }
    });
  }

}
