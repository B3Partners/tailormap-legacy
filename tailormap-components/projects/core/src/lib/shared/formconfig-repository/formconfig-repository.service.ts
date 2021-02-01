import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormConfiguration, FormConfigurations } from '../../feature-form/form/form-models';
import { DomainRepositoryService } from '../../feature-form/linked-fields/domain-repository/domain-repository.service';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { LayerUtils } from '../layer-utils/layer-utils.service';
import { FeatureControllerService } from '../generated';
import { of, ReplaySubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormState } from '../../feature-form/state/form.state';
import { Store } from '@ngrx/store';
import * as FormActions from '../../feature-form/state/form.actions';

@Injectable({
  providedIn: 'root',
})
export class FormconfigRepositoryService {

  private formConfigs: Map<string, FormConfiguration>;

  public formConfigs$ = new ReplaySubject<Map<string, FormConfiguration>>(1);

  constructor(
    private http: HttpClient,
    private featureController: FeatureControllerService,
    private domainRepo: DomainRepositoryService,
    private tailorMap: TailorMapService,
    private store$ : Store<FormState>,
  ) {
    this.http.get<FormConfigurations>(this.tailorMap.getContextPath() + '/action/form', {
      params: new HttpParams().set('application', '' + this.tailorMap.getApplicationId()),
    })
      .subscribe((data: FormConfigurations) => {
        this.formConfigs = new Map<string, FormConfiguration>();
        const featureTypes = [];
        for (const key in data.config) {
          if (data.config.hasOwnProperty(key)) {
            const sanitized = LayerUtils.sanitizeLayername(key);
            this.formConfigs.set(sanitized, data.config[key]);
            featureTypes.push(sanitized);
          }
        }

        this.featureController.featuretypeInformation({featureTypes})
          .pipe(catchError(e => of(null)))
          .subscribe(info => {
            if (!info) {
              return;
            }
            info.forEach(featuretypeMetadata => {
              if (this.formConfigs.has(featuretypeMetadata.featuretypeName)) {
                const config = this.formConfigs.get(featuretypeMetadata.featuretypeName);
                this.formConfigs.set(featuretypeMetadata.featuretypeName, { ...config, featuretypeMetadata });
              }
            });

            this.store$.dispatch(FormActions.setFormConfigs ({formConfigs: this.formConfigs}));

            this.formConfigs$.next(this.formConfigs);
            this.domainRepo.initFormConfig(this.formConfigs);
        });

      });
  }

}
