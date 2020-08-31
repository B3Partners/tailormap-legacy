import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {
  Attribute,
  FormConfiguration,
  FormConfigurations,
  FormFieldType,
  SelectOption
} from "../../form/form-models";
import {LinkedAttributeRegistryService} from "../registry/linked-attribute-registry.service";
import {AttribuutControllerService, Attribuut} from "../../../shared/generated";

@Injectable({
  providedIn: 'root'
})
export class DomainRepositoryService {
  private formConfigs: FormConfigurations;
  private linkedAttributes:  Array<Attribuut>;
  private domainToAttribute: { [key: string]: Attribute;}

  constructor(
    private repo: AttribuutControllerService,
    private registry: LinkedAttributeRegistryService) {
  }

  public initFormConfig(formConfigs: FormConfigurations) {
    this.formConfigs = formConfigs;
    const domainAttrs: number[] = [];
    for (let key in formConfigs.config) {
      if (formConfigs.config.hasOwnProperty(key)) {
        let config = formConfigs.config[key];
        config.fields.forEach(attribute => {
          if (attribute.type === FormFieldType.DOMAIN) {
            domainAttrs.push(attribute.linkedList);
          }
        });
      }
    }

    if (domainAttrs.length > 0) {
      this.repo.attributes(domainAttrs).subscribe(result => {
        this.linkedAttributes = result;
        this.registry.setLinkedAttributes(this.linkedAttributes);
        for(let attribute of this.linkedAttributes){
          let featureType = attribute.object_naam.toLowerCase();
          let fc: FormConfiguration = this.formConfigs.config[featureType];
          fc.fields.forEach(field => {
            if (field.linkedList && field.linkedList === attribute.id) {
              const options : SelectOption[]= [];
              let domeinwaardes = attribute.domein.waardes;

              for (var domeinwaarde of domeinwaardes) {
                options.push({
                  label: domeinwaarde.synoniem || domeinwaarde.waarde,
                  val: domeinwaarde.id,
                  disabled: false
                });
              }
              field.options = options;
            }
          });
        }
      });
    }
  }

}
