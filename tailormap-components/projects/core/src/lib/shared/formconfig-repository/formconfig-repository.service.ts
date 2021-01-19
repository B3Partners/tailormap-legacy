import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import {
  FormConfiguration,
  FormConfigurations,
} from '../../feature-form/form/form-models';
import { DomainRepositoryService } from '../../feature-form/linked-fields/domain-repository/domain-repository.service';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { LayerUtils } from '../layer-utils/layer-utils.service';
import {
  Feature,
  FeatureControllerService,
} from '../generated';
import {
  Observable,
  of,
  ReplaySubject,
} from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
  ) {
    this.http.get<FormConfigurations>(this.tailorMap.getContextPath() + '/action/form', {
      params: new HttpParams().set('application', '' + this.tailorMap.getViewerController().app.id),
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

            this.formConfigs$.next(this.formConfigs);
            this.domainRepo.initFormConfig(this.formConfigs);
        });

      });
  }

  public getFormConfigForLayer$(layerName: string): Observable<FormConfiguration | undefined> {
    return this.formConfigs$.pipe(map(formConfigs => formConfigs.get(LayerUtils.sanitizeLayername(layerName))));
  }

  public getFeatureLabel(feature: Feature): string {
    const config: FormConfiguration = this.getFormConfig(feature.clazz);
    let label = this.getFeatureValue(feature, config.treeNodeColumn);
    if (config.idInTreeNodeColumn) {
      const id = feature.objectGuid;

      label = (label ? label : config.name) + ' (id: ' + id + ')';
    }
    return label;
  }

  private getFeatureValue(feature: Feature, key: string): any {
    const val = feature[key];
    return val;
  }

  public getAllFormConfigs(): Map<string, FormConfiguration> {
    return this.formConfigs;
  }

  public getFormConfig(featureType: string): FormConfiguration {
    return this.formConfigs.get(featureType);
  }

  public getFeatureTypes(): string[] {
    return this.formConfigs ? Array.from(this.formConfigs.keys()) : [];
  }
}
