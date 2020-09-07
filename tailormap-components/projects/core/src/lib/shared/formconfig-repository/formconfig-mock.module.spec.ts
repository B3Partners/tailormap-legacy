import { NgModule } from '@angular/core';
import { FormconfigRepositoryService } from './formconfig-repository.service';

export const mockConfigsJson = '{"config": {"test": {"tabs": 1,"name": "testFT","featureType": "test","treeNodeColumn" : "colToShow","newPossible": true,"tabConfig": {"1": "test"},"relation":null,"fields": [{ "key": "colToShow","column" : 1,"tab": 1,"type": "textfield"}]}}}';

const featureRepoSpy = {
  getAllFormConfigs: function(){
    return {config: {}};
  },
  getFormConfig: function(){
    return {fields: []};
  }
}
@NgModule({
  providers: [{
    provide: FormconfigRepositoryService,
    useValue: featureRepoSpy,
  }],
})
export class FormConfigMockModule { }
