import { Injectable } from '@angular/core';
import {
  Attribute,
  FormConfiguration,
  FormFieldType,
  SelectOption,
} from '../../form/form-models';
import { LinkedAttributeRegistryService } from '../registry/linked-attribute-registry.service';
import {
  AttributeControllerService,
  Attribuut,
} from '../../../shared/generated';
import { LayerUtils } from '../../../shared/layer-utils/layer-utils.service';

@Injectable({
  providedIn: 'root',
})
export class DomainRepositoryService {
  private formConfigs: Map<string, FormConfiguration>;
  private linkedAttributes: Array<Attribuut>;
  // tslint:disable-next-line:no-unused-variable
  private domainToAttribute: { [key: string]: Attribute; }

  constructor(
    private repo: AttributeControllerService,
    private registry: LinkedAttributeRegistryService) {
  }

  public initFormConfig(formConfigs: Map<string, FormConfiguration>) {
    this.formConfigs = formConfigs;
    const domainAttrs: Array<number> = [];
    formConfigs.forEach((config, key) => {
      config.fields.forEach(attribute => {
        if (attribute.type === FormFieldType.DOMAIN) {
          domainAttrs.push(attribute.linkedList);
        }
      });
    });
    if (domainAttrs.length > 0) {
      this.repo.attributes({ids: domainAttrs}).subscribe(result => {

        this.linkedAttributes = result;
        this.registry.setLinkedAttributes(this.linkedAttributes);
        for (const attribute of this.linkedAttributes) {
          const featureType = LayerUtils.sanitizeLayername(attribute.tabel_naam.toLowerCase());
          const fc: FormConfiguration = this.formConfigs.get(featureType);
          if (!fc) {
            continue;
          }
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
