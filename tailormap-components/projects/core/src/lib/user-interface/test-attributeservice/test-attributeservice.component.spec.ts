import {
  async,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { TestAttributeserviceComponent } from './test-attributeservice.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '../../shared/shared.module';

describe('TestAttributeserviceComponent', () => {
  let component: TestAttributeserviceComponent;
  let fixture: ComponentFixture<TestAttributeserviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        HttpClientTestingModule,
      ],
      declarations: [ TestAttributeserviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAttributeserviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
