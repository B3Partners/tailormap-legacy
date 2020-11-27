import { AttributeDataSource } from './attributelist-datasource';
import { AttributelistFilter } from './attributelist-filter';
import { ValueService } from '../../../shared/value-service/value.service';
import { MatDialog } from '@angular/material/dialog';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

describe('AttributelistFilter', () => {
  let dataSource: AttributeDataSource;
  let valueService: ValueService;
  let dialog: MatDialog;
  let fixture: ComponentFixture<AttributeDataSource>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    valueService = TestBed.inject(ValueService);
    fixture = TestBed.createComponent(AttributeDataSource);
    dataSource  = fixture.componentInstance;
  });

  it('should create an instance', () => {
    expect(new AttributelistFilter(
      dataSource,
      valueService,
      dialog
    )).toBeTruthy();
  });
});
