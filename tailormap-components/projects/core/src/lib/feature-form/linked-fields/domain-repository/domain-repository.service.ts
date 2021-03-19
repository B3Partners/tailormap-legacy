import { Injectable, OnDestroy } from '@angular/core';
import { FormConfiguration, FormFieldType, SelectOption } from '../../form/form-models';
import { LinkedAttributeRegistryService } from '../registry/linked-attribute-registry.service';
import { AttributeControllerService, Attribuut } from '../../../shared/generated';
import { LayerUtils } from '../../../shared/layer-utils/layer-utils.service';
import { FormState } from '../../state/form.state';
import { Store } from '@ngrx/store';
import { Observable, of, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DomainRepositoryService implements OnDestroy {

  private destroyed = new Subject();

  constructor(
    private repo: AttributeControllerService,
    private store$: Store<FormState>,
    private registry: LinkedAttributeRegistryService) {
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public initFormConfig$(formConfigs: Map<string, FormConfiguration>): Observable<Map<string, FormConfiguration>> {
    const domainAttrs: Array<number> = [];
    formConfigs.forEach((config, key) => {
      config.fields.forEach(attribute => {
        if (attribute.type === FormFieldType.DOMAIN) {
          domainAttrs.push(attribute.linkedList);
        }
      });
    });
    if (domainAttrs.length === 0) {
      return of(formConfigs);
    }
    return this.repo.attributes({ids: domainAttrs})
      .pipe(
        takeUntil(this.destroyed),
        tap(linkedAttributes => {
          this.registry.setLinkedAttributes(linkedAttributes);
        }),
        map(result => {
          const linkedAttributes: Array<Attribuut> = result;
          for (const attribute of linkedAttributes) {
            const featureType = LayerUtils.sanitizeLayername(attribute.tabel_naam.toLowerCase());
            const fc: FormConfiguration = formConfigs.get(featureType);
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
          return formConfigs;
        }),
      );
  }

}
