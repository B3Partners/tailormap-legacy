import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import {
  StatisticParameters,
  StatisticResponse,
} from './statistic-models';

@Injectable({
  providedIn: 'root',
})
export class StatisticService {

  constructor(private http: HttpClient) {
  }

  public statisticValue (params: StatisticParameters): any {
    let httpParams: HttpParams = new HttpParams();
    Object.entries(params).forEach(([key, value ]) => {
      httpParams = httpParams.set(key, String(value));
    });
    return this.http.get<StatisticResponse>('/viewer/action/statisticanalysis', {params: httpParams});
  }

}
