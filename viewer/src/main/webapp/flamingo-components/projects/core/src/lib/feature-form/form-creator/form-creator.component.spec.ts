import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCreatorComponent } from './form-creator.component';
import {Feature, FeatureControllerService, Wegvakonderdeelplanning} from "../../shared/generated";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {FeatureFormModule} from "../feature-form.module";
import {Attribute, FormConfiguration} from "../form/form-models";
import {FormfieldComponent} from "../form-field/formfield.component";
import {FormComponent} from "../form/form.component";
import {FormPopupComponent} from "../form-popup/form-popup.component";
import {FormTreeComponent} from "../form-tree/form-tree.component";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {Wegvakonderdeel} from "../../shared/generated/model/wegvakonderdeel";
import {AddFeatureComponent} from "../../user-interface/add-feature/add-feature.component";
import {FeatureInitializerService} from "../../shared/feature-initializer/feature-initializer.service";

describe('FormCreatorComponent', () => {
  let component: FormCreatorComponent;
  let fixture: ComponentFixture<FormCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        SharedModule,
        //FeatureFormModule,
      ],
      providers:[
        FeatureControllerService,

      ],
      declarations: [
        FormCreatorComponent,
        FormComponent,
        AddFeatureComponent,
        FormPopupComponent,
        FormTreeComponent,
        FormfieldComponent,
        FormCreatorComponent,]
    })
    .compileComponents();

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCreatorComponent);
    component = fixture.componentInstance;
    let formConfig : FormConfiguration = {
      featureType: "", newPossible: false, tabConfig: undefined,
      fields: [],
      tabs: 0,
      name: 'pietje',
      treeNodeColumn:'wer'
    };
    component.formConfig = formConfig;
    component.ngOnChanges();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update a childfeature in the features array', ()=>{
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
    expect(newArray.length === 1).toBeTruthy();
    expect(newArray[0].object_guid).toEqual('een');
    expect(newArray[0].children.length).toEqual(1);
    expect((newArray[0].children[0] as Wegvakonderdeelplanning).maatregel_wvko).toEqual(featureIsChanged.maatregel_wvko);
  });

  it('should update the parent feature in the features array', ()=>{
    let featureToBeChanged : Wegvakonderdeel ={
      objecttype: "wegvakonderdeel",
      object_guid: "een",
      aanlegjaar: 15,
      children:[
        {
          objecttype: "wegvakonderdeelplanning",
          object_guid: "twee",
          maatregel_wvko: "foo"
        } as Wegvakonderdeelplanning]
    };

    let featureIsChanged : Wegvakonderdeel ={
      objecttype: "wegvakonderdeel",
      object_guid: "een",
      aanlegjaar: 16,
      children:[
        {
          objecttype: "wegvakonderdeelplanning",
          object_guid: "twee",
          maatregel_wvko: "foo"
        } as Wegvakonderdeelplanning]
    };

    let featuresArray = [featureToBeChanged ];
    let newArray = component.updateFeatureInArray(featureIsChanged, featuresArray);
    expect(newArray.length === 1).toBeTruthy();
    expect(newArray[0].object_guid).toEqual('een');
    expect(newArray[0].children.length).toEqual(1);
    expect((newArray[0] as Wegvakonderdeel).aanlegjaar).toEqual(featureIsChanged.aanlegjaar);
  });


  it('should update the objecttguid of a new feature in  features array', ()=>{

    let featureIsChanged : Wegvakonderdeel ={
      objecttype: "wegvakonderdeel",
      object_guid: "een",
      aanlegjaar: 16,
      children:[]
    };
    let baseFeature: Wegvakonderdeel  = {
      objecttype: "wegvakonderdeel",
      object_guid: FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT
    };
    let featuresArray = [baseFeature];
    let newArray = component.updateFeatureInArray(featureIsChanged, featuresArray);
    expect(newArray.length === 1).toBeTruthy();
    expect(newArray[0].object_guid).toEqual('een');
    expect(newArray[0].children.length).toEqual(0);
    expect((newArray[0] as Wegvakonderdeel).aanlegjaar).toEqual(featureIsChanged.aanlegjaar);
  });
});
