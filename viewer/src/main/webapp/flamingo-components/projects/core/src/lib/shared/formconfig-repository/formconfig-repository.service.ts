import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {FormConfiguration, FormConfigurations} from "../../feature-form/form/form-models";
import {DomainRepositoryService} from "../linked-fields/domain-repository/domain-repository.service";

@Injectable({
  providedIn: 'root'
})
export class FormconfigRepositoryService {

  private formConfigs: FormConfigurations;
  private config: any;

  constructor(private http: HttpClient,
  private domainRepo :DomainRepositoryService,) {
    this.http.get<FormConfigurations>('http://localhost:8084/viewer/action/form').subscribe((data: any) => {
      this.formConfigs = data;
      this.domainRepo.initFormConfig(this.formConfigs);
    });

  }

  public isLoaded():boolean{
    return !!this.formConfigs;
  }

  public getAllFormConfigs(): FormConfigurations{
    return this.formConfigs;
  }

  public getFormConfig(featureType: string) : FormConfiguration{
    return this.formConfigs.config[featureType];
  }

  public getFeatureTypes(): string[]{
    let featuresTypes = [];
    if(this.formConfigs) {
      for (let key in this.formConfigs.config) {
        featuresTypes.push(key);
      }
    }
    return featuresTypes;
  }
}
