import { FeatureInitializerService } from './feature-initializer.service';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { defaultRootState } from '../../state/root-state.model';
import { FormConfiguration, FormFieldType } from '../../feature-form/form/form-models';
import { applicationStateKey } from '../../application/state/application.state';
import { ExtendedFormConfigurationModel } from '../../application/models/extended-form-configuration.model';

describe('FeatureInitializerService', () => {
  const wegvakconfig: ExtendedFormConfigurationModel = {
    featureType: 'wegvakonderdeel',
    tableName: 'wegvakonderdeel',
    fields: [{key: 'test',type: FormFieldType.TEXTFIELD,column:1,label:'swdf',tab: 1}],
    name: 'wegvakonderdeeltest', tabConfig: undefined, tabs: 0, treeNodeColumn: 'test',
  };
  const wegvakplanningconfig: ExtendedFormConfigurationModel = {
    featureType: 'wegvakonderdeelplanning',
    tableName: 'wegvakonderdeelplanning',
    fields: [{key: 'test',type: FormFieldType.TEXTFIELD,column:1,label:'swdf',tab: 1}],
    name: 'wegvakonderdeelplanningtest', tabConfig: undefined, tabs: 0, treeNodeColumn: 'test',
  };
  let service: SpectatorService<FeatureInitializerService>;
  const initialState = { ...defaultRootState,
    [applicationStateKey]: {
      ...[applicationStateKey],
      formConfigs:[
        wegvakconfig,
        wegvakplanningconfig,
      ],
    },
  };
  let store: MockStore;
  const createService = createServiceFactory({
    service: FeatureInitializerService,
    providers: [
      provideMockStore({ initialState }),
    ],
  });

  beforeEach(() => {
    service = createService();
    store = service.inject(MockStore);
  });

  it('should create', () => {
    expect(service.service).toBeTruthy();
  });

  it('should create wegvakonderdeel', () => {
    service.service.create$('wegvakonderdeel',{}).subscribe(wv=> {
      expect(wv).toBeTruthy();
    },error => {
      fail(error.message);
    });
  });

  it('should create wegvakonderdeelplanning', () => {
    service.service.create$('wegvakonderdeelplanning',{}).subscribe(wv=>{
      expect(wv).toBeTruthy();
    },error => {
      fail(error.message);
    });
  });


  it('should create wegvakonderdeel and contain the passed params', () => {
    const params = {
      piet: 'jan',
      smit: 'mon',
    };
    service.service.create$('wegvakonderdeel',params).subscribe(wv=>{
      expect(wv).toBeTruthy();
      for (const param in params) {
        if (params.hasOwnProperty(param)) {
          const val = wv.attributes.find(attr=>attr.key ===param);
          expect(val).toBeTruthy();
          expect(val.value).toBe(params[param]);
        }
      }
    },error => {
      fail(error.message);
    });
  });

  it('should not create non-existing object and throw error', () => {
    service.service.create$('DUMMY', {}).subscribe(
      value => {
        fail('cannot happen');
      },
      error => {
        expect(error.message).toBe('Featuretype not implemented: DUMMY');
      });
  });
});
