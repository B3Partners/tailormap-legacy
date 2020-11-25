import { AttributelistStatistic } from './attributelist-statistic';
import { StatisticService } from '../../../shared/statistic-service/statistic.service';
import { TestBed } from '@angular/core/testing';

describe('AttributelistStatistic', () => {
  let statisticsService: StatisticService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    statisticsService = TestBed.inject(StatisticService);
  });

  it('should create an instance', () => {
    expect(new AttributelistStatistic(
      this.statisticsService,
      this.dataSource,
    )).toBeTruthy();
  });
});
