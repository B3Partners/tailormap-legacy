import { Injectable } from '@angular/core';
import {
  Attribute,
  FormConfiguration,
  FormConfigurations,
  FormFieldType,
  SelectOption,
} from '../../form/form-models';
import { LinkedAttributeRegistryService } from '../registry/linked-attribute-registry.service';
import {
  AttributeControllerService,
  Attribuut,
} from '../../../shared/generated';

@Injectable({
  providedIn: 'root',
})
export class DomainRepositoryService {
  private formConfigs: FormConfigurations;
  private linkedAttributes: Array<Attribuut>;
  // tslint:disable-next-line:no-unused-variable
  private domainToAttribute: { [key: string]: Attribute; }

  constructor(
    private repo: AttributeControllerService,
    private registry: LinkedAttributeRegistryService) {
  }

  public initFormConfig(formConfigs: FormConfigurations) {
    this.formConfigs = formConfigs;
    const domainAttrs: Array<number> = [];
    for (const key in formConfigs.config) {
      if (formConfigs.config.hasOwnProperty(key)) {
        const config = formConfigs.config[key];
        config.fields.forEach(attribute => {
          if (attribute.type === FormFieldType.DOMAIN) {
            domainAttrs.push(attribute.linkedList);
          }
        });
      }
    }

    if (domainAttrs.length > 0) {
      this.repo.attributes({ids: domainAttrs}).subscribe(result => {

        this.linkedAttributes = result;
        this.registry.setLinkedAttributes(this.linkedAttributes);
        for (const attribute of this.linkedAttributes) {
          const featureType = attribute.object_naam.toLowerCase();
          const fc: FormConfiguration = this.formConfigs.config[featureType];
          fc.fields.forEach(field => {
            if (field.linkedList && field.linkedList === attribute.id) {
              const options: SelectOption[] = [];
              const domeinwaardes = attribute.domein.waardes;

              for (const domeinwaarde of domeinwaardes) {
                options.push({
                  label: domeinwaarde.synoniem || domeinwaarde.waarde,
                  val: domeinwaarde.id,
                  disabled: false,
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
