import { Injectable } from '@angular/core';
import { FormConfiguration, FormFieldType, SelectOption } from '../../form/form-models';
import { LinkedAttributeRegistryService } from '../registry/linked-attribute-registry.service';
import { AttributeControllerService, Attribuut } from '../../../shared/generated';
import { forkJoin, Observable, of } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectFormConfigForFeatureTypeName } from '../../../application/state/application.selectors';
import { ExtendedFormConfigurationModel } from '../../../application/models/extended-form-configuration.model';

interface DomainFieldOptionsModel {
  linkedList: number;
  options: SelectOption[];
}

interface DomainOptionsModel {
  featureType: string;
  fields: DomainFieldOptionsModel[];
}

@Injectable({
  providedIn: 'root',
})
export class DomainRepositoryService {

  private optionsList: DomainOptionsModel[] = [];

  constructor(
    private repo: AttributeControllerService,
    private registry: LinkedAttributeRegistryService,
    private store$: Store,
  ) {
  }

  public getFormConfigWithDomainOptions$(featureType: string) {
    return this.store$.select(selectFormConfigForFeatureTypeName, featureType)
      .pipe(
        concatMap(formConfig => {
          return !!formConfig
            ? forkJoin([ of(formConfig), this.getDomainOptions$(formConfig) ])
            : of(null);
        }),
        map((result: null | [ ExtendedFormConfigurationModel, DomainOptionsModel | null ]) => {
          if (result === null) {
            return null;
          }
          const [ formConfig, domainOptions ] = result;
          if (domainOptions) {
            const formConfigFields = formConfig.fields.map(field => {
              const options = domainOptions.fields.find(f => f.linkedList === field.linkedList);
              if (options) {
                return { ...field, options: options.options };
              }
              return field;
            });
            return {
              ...formConfig,
              fields: formConfigFields,
            };
          }
          return formConfig;
        }),
      );
  }

  public getDomainOptions$(formConfig: FormConfiguration): Observable<DomainOptionsModel | null> {
    const cachedList = this.optionsList.find(o => o.featureType === formConfig.featureType);
    if (cachedList) {
      return of(cachedList);
    }
    const domainAttrs: Array<number> = [];
    formConfig.fields.forEach(attribute => {
      if (attribute.type === FormFieldType.DOMAIN) {
        domainAttrs.push(attribute.linkedList);
      }
    });
    if (domainAttrs.length === 0) {
      return of(null);
    }
    return this.repo.attributes({ids: domainAttrs})
      .pipe(
        tap(linkedAttributes => {
          this.registry.setLinkedAttributes(linkedAttributes);
        }),
        map(result => {
          const linkedAttributes: Array<Attribuut> = result;
          const domainOptions: DomainOptionsModel = { featureType: formConfig.featureType, fields: [] };
          for (const attribute of linkedAttributes) {
            const featureType = attribute.tabel_naam.toLowerCase();
            if (formConfig.featureType !== featureType) {
              continue;
            }
            formConfig.fields.forEach(field => {
              if (field.linkedList && field.linkedList === attribute.id) {
                const options: SelectOption[] = [];
                const domeinwaardes = attribute.domein.waardes;
                for (const domeinwaarde of domeinwaardes) {
                  options.push({
                    label: domeinwaarde.synoniem || domeinwaarde.waarde,
                    val: domeinwaarde.waarde,
                    disabled: false,
                    id: domeinwaarde.id,
                  });
                }
                options.sort((opt1, opt2) => opt1.label === opt2.label ? 0 : (opt1.label > opt2.label ? 1 : -1));
                domainOptions.fields.push({ linkedList: field.linkedList, options });
              }
            });
          }
          this.optionsList.push(domainOptions);
          return domainOptions;
        }),
      );
  }

}
