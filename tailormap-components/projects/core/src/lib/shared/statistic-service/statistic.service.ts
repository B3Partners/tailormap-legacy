import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import {
  StatisticParameters,
  StatisticResponse,
} from './statistic-models';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { Observable } from 'rxjs';
import { StatisticServiceModel } from '@tailormap/models';

@Injectable({
  providedIn: 'root',
})
export class StatisticService implements StatisticServiceModel {

  constructor(
    private http: HttpClient,
    private tailorMap: TailorMapService,
    ) {

  }

  public statisticValue$ (params: StatisticParameters): Observable<StatisticResponse> {
    let httpParams: HttpParams = new HttpParams();
    Object.entries(params).forEach(([key, value ]) => {
      httpParams = httpParams.set(key, String(value));
    });
    return this.http.get<StatisticResponse>(this.tailorMap.getContextPath() + '/action/statisticanalysis', {params: httpParams});
  }

}
