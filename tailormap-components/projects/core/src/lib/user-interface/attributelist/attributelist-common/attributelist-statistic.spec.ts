import { AttributeDataSource } from '../attributelist-common/attributelist-datasource';
import { AttributelistStatistic } from './attributelist-statistic';
import { StatisticService } from '../../../shared/statistic-service/statistic.service';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

describe('AttributelistStatistic', () => {
  let statisticsService: StatisticService;
  let dataSource: AttributeDataSource;
  let fixture: ComponentFixture<AttributeDataSource>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    statisticsService = TestBed.inject(StatisticService);
    fixture = TestBed.createComponent(AttributeDataSource);
    dataSource  = fixture.componentInstance;
  });

  it('should create an instance', () => {
    expect(new AttributelistStatistic(
      statisticsService,
      dataSource,
    )).toBeTruthy();
  });
});
