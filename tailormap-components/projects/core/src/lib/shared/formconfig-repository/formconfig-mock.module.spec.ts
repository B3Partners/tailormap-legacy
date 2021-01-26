import { NgModule } from '@angular/core';
import { FormconfigRepositoryService } from './formconfig-repository.service';
import { createSpyObject } from '@ngneat/spectator';
import { Feature } from '../generated';
import { of } from 'rxjs';

export const mockConfigsJson = '{"config": {"test": {"tabs": 1,"name": "testFT","featureType": "test","treeNodeColumn" : "colToShow","newPossible": true,"tabConfig": {"1": "test"},"relation":null,"fields": [{ "key": "colToShow","column" : 1,"tab": 1,"type": "textfield"}]}}}';

const featureRepoSpy = createSpyObject(FormconfigRepositoryService, {
  formConfigs$: of(new Map()),
  getAllFormConfigs: function(){
    return new Map();
  },
  getFormConfig: function(){
    return {fields: []};
  },
  getFeatureLabel(feature: Feature): string {
    return '';
  }
});

@NgModule({
  providers: [{
    provide: FormconfigRepositoryService,
    useValue: featureRepoSpy,
  }],
})
export class FormConfigMockModule { }
