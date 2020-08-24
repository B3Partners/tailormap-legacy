import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormfieldComponent} from './formfield.component';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {FormFieldType} from "../form/form-models";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('WegvakFormfieldComponent', () => {
  let component: FormfieldComponent;
  let fixture: ComponentFixture<FormfieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
      ],
      declarations: [ FormfieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormfieldComponent);
    component = fixture.componentInstance;
    component.attribute = {column: 0, key: "aap", tab: 0, type: FormFieldType.HIDDEN, value: ""};
    let controls = {};
    controls[component.attribute.key] = new FormControl(component.attribute.value);
    component.groep = new FormGroup(controls);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
