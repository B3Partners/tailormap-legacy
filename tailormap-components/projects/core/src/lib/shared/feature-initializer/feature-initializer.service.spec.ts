import {FeatureInitializerService} from './feature-initializer.service';

describe('FeatureInitializerService', () => {
  let component: FeatureInitializerService;

  beforeEach(() => {
    component = new FeatureInitializerService();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create wegvakonderdeel', () => {
    const wv = component.create('Wegvakonderdeel',{});
    expect(wv).toBeTruthy();
  });

  it('should create wegvakonderdeelplanning', () => {
    const wv = component.create('Wegvakonderdeelplanning',{});
    expect(wv).toBeTruthy();
  });


  it('should create wegvakonderdeel and contain the passed params', () => {
    const params = {
      piet: 'jan',
      smit: "mon"
    };
    const wv = component.create('Wegvakonderdeel',params);
    expect(wv).toBeTruthy();
    for(let param in params){
      expect(wv[param]).toBeTruthy();
    }
  });

  it('should not create non-existing object and throw error', () => {
    expect(function(){
      component.create('DUMMY', {});
    }).toThrow(new Error("Featuretype not implemented: DUMMY"));

  });
});
