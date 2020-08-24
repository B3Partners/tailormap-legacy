import { Injectable } from '@angular/core';
import {FormConfiguration, FormConfigurations} from "../../feature-form/form/form-models";

@Injectable({
  providedIn: 'root'
})
export class FormconfigRepositoryService {

  private formConfigs: FormConfigurations;

  constructor() { }

  public setFormConfigs(formConfigs: FormConfigurations){
    this.formConfigs = formConfigs;
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
