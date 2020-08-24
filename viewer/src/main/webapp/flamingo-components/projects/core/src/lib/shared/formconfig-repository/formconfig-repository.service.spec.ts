import { TestBed } from '@angular/core/testing';

import { FormconfigRepositoryService } from './formconfig-repository.service';
import {FormConfiguration, FormConfigurations} from "../../feature-form/form/form-models";

describe('FormconfigRepositoryService', () => {

  let configsstring = '{"config": {"test": {"tabs": 1,"name": "testFT","featureType": "test","treeNodeColumn" : "colToShow","newPossible": true,"tabConfig": {"1": "test"},"relation":null,"fields": [{ "key": "colToShow","column" : 1,"tab": 1,"type": "textfield"}]}}}';
  const formConfigs: FormConfigurations = JSON.parse(configsstring);
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormconfigRepositoryService = TestBed.inject(FormconfigRepositoryService);
    expect(service).toBeTruthy();
  });

  it('should return all formconfigs', () => {
    const service: FormconfigRepositoryService = TestBed.inject(FormconfigRepositoryService);
    service.setFormConfigs(formConfigs);
    expect(service.getAllFormConfigs()).toBeTruthy();
    expect(service.getAllFormConfigs().config).toBeTruthy();
    expect(service.getAllFormConfigs().config['test']).toBeTruthy();
  });

  it('should return all featuretypes', () => {
    const service: FormconfigRepositoryService = TestBed.inject(FormconfigRepositoryService);
    service.setFormConfigs(formConfigs);
    expect(service.getFeatureTypes()).toContain('test');
    expect(service.getFeatureTypes().length).toBe(1);
  });

  it('should return no featuretypes when no configs present', () => {
    const service: FormconfigRepositoryService = TestBed.inject(FormconfigRepositoryService);
    expect(service.getFeatureTypes().length).toBe(0);
  });
});
