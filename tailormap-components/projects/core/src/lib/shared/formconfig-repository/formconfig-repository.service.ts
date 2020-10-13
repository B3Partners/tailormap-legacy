import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormConfiguration,
  FormConfigurations,
} from '../../feature-form/form/form-models';
import { DomainRepositoryService } from '../../feature-form/linked-fields/domain-repository/domain-repository.service';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { LayerUtils } from '../layer-utils/layer-utils.service';
import { Feature } from '../generated';

@Injectable({
  providedIn: 'root',
})
export class FormconfigRepositoryService {

  private formConfigs: FormConfigurations;

  constructor(
    private http: HttpClient,
    private domainRepo: DomainRepositoryService,
    private tailorMap: TailorMapService,
  ) {
    this.http.get<FormConfigurations>(this.tailorMap.getContextPath() + '/action/form').subscribe((data: FormConfigurations) => {
      this.formConfigs = {
        config: new Map<string, FormConfiguration>(),
      };
      for (const key in data.config) {
        if (data.config.hasOwnProperty(key)) {
          const sanitized = LayerUtils.sanitzeLayername(key);
          this.formConfigs.config[sanitized] = data.config[key];
        }
      }

      this.domainRepo.initFormConfig(this.formConfigs);
    });

  }

  public isLoaded(): boolean {
    return !!this.formConfigs;
  }

  public getAllFormConfigs(): FormConfigurations {
    return this.formConfigs;
  }

  public getFormConfig(featureType: string): FormConfiguration {
    return this.formConfigs.config[featureType];
  }

  public getFeatureTypes(): string[] {
    return this.formConfigs ? Object.keys(this.formConfigs.config) : [];
  }

  public getFeatureLabel(feature: Feature) : string {
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

}
