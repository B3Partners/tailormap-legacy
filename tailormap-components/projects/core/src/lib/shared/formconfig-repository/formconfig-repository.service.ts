import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormConfiguration,
  FormConfigurations,
} from '../../feature-form/form/form-models';
import { DomainRepositoryService } from '../../feature-form/linked-fields/domain-repository/domain-repository.service';

@Injectable({
  providedIn: 'root',
})
export class FormconfigRepositoryService {

  private formConfigs: FormConfigurations;

  constructor(private http: HttpClient,
              private domainRepo: DomainRepositoryService) {
    this.http.get<FormConfigurations>('/viewer/action/form').subscribe((data: any) => {
      this.formConfigs = data;
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
}
