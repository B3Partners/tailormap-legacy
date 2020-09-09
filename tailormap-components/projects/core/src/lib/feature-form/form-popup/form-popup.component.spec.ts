import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FormPopupComponent} from './form-popup.component';
import {SharedModule} from "../../shared/shared.module";
import {AddFeatureComponent} from "../../user-interface/add-feature/add-feature.component";
import {FeatureControllerService} from "../../shared/generated";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { FormConfigMockModule } from '../../shared/formconfig-repository/formconfig-mock.module.spec';

describe('FormPopupComponent', () => {
  let component: FormPopupComponent;
  let fixture: ComponentFixture<FormPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        MatSnackBarModule,
        FormConfigMockModule,
      ],
      providers: [
        FeatureControllerService
      ],
      declarations: [

        AddFeatureComponent,
        FormPopupComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
