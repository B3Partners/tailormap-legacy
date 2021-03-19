import { NgModule } from '@angular/core';
import { FormConfigRepositoryService } from './form-config-repository.service';
import { createSpyObject } from '@ngneat/spectator';
import { Observable, of } from 'rxjs';
import { FormConfiguration } from '../../feature-form/form/form-models';

// eslint-disable-next-line max-len
export const mockConfigsJson = '{"config": {"test": {"tabs": 1,"name": "testFT","featureType": "test","treeNodeColumn" : "colToShow","newPossible": true,"tabConfig": {"1": "test"},"relation":null,"fields": [{ "key": "colToShow","column" : 1,"tab": 1,"type": "textfield"}]}}}';

const featureRepoSpy = createSpyObject(FormConfigRepositoryService, {
  loadFormConfiguration$(): Observable<Map<string, FormConfiguration>> {
    return of(new Map());
  },
});

@NgModule({
  providers: [{
    provide: FormConfigRepositoryService,
    useValue: featureRepoSpy,
  }],
})
export class FormConfigMockModule { }
