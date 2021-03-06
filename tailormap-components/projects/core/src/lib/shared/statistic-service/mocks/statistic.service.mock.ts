import { createSpyObject } from '@ngneat/spectator';
import { StatisticService } from '../statistic.service';
import { StatisticParameters, StatisticResponse } from '../statistic-models';
import { Observable, of } from 'rxjs';

const mockStatisticResponse: StatisticResponse = {
  result: 1,
  success: true,
};

export const createStatisticServiceMock = (template?: Partial<Record<keyof StatisticService, any>>) => {
  return createSpyObject(StatisticService, {
    statisticValue$(params: StatisticParameters): Observable<StatisticResponse> {
      return of(mockStatisticResponse);
    },
    ...template,
  });
};

export const getStatisticServiceMockProvider = (template?: Partial<Record<keyof StatisticService, any>>) => {
  return { provide: StatisticService, useValue: createStatisticServiceMock(template) };
};
