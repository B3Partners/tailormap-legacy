import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCreatorComponent } from './form-creator.component';
import {Feature, Wegvakonderdeelplanning} from "../../shared/generated";

fdescribe('FormCreatorComponent', () => {
  let component: FormCreatorComponent;
  let fixture: ComponentFixture<FormCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the new feature in the features array', ()=>{
    let featureToBeChanged : Wegvakonderdeelplanning ={
      objecttype: "wegvakonderdeelplanning",
      object_guid: "twee",
      maatregel_wvko: "bar"
    };

    let featureIsChanged : Wegvakonderdeelplanning ={
      objecttype: "wegvakonderdeelplanning",
      object_guid: "twee",
      maatregel_wvko: "foo"
    };


    let featuresArray: Feature[];
    featuresArray = [
      {
        object_guid: "een",
        objecttype: "wegvakonderdeel",
        children: [
         featureToBeChanged
        ]
      }
    ];
    let newArray = component.updateFeatureInArray(featureIsChanged, featuresArray);
    expect(newArray[0].children.length === 1);
    expect((newArray[0].children[0] as Wegvakonderdeelplanning).maatregel_wvko === featureIsChanged.maatregel_wvko);
  });
});
