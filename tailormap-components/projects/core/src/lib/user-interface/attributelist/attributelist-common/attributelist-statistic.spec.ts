import { AttributeDataSource } from '../attributelist-common/attributelist-datasource';
import { AttributelistStatistic } from './attributelist-statistic';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { FormconfigRepositoryService } from '../../../shared/formconfig-repository/formconfig-repository.service';
import { LayerService } from '../layer.service';
import { StatisticService } from '../../../shared/statistic-service/statistic.service';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

describe('AttributelistStatistic', () => {
  let statisticsService: StatisticService;
  let attributeService: AttributeService;
  let formconfigRepoService: FormconfigRepositoryService;
  let layerService: LayerService;
  let dataSource: AttributeDataSource;
  let fixture: ComponentFixture<AttributeDataSource>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    statisticsService = TestBed.inject(StatisticService);
    attributeService = TestBed.inject(AttributeService);
    formconfigRepoService = TestBed.inject(FormconfigRepositoryService);
    layerService = TestBed.inject(LayerService);
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
