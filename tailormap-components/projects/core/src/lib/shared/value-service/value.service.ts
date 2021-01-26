import { Injectable } from '@angular/core';
import {
  HttpClient, HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import {
  UniqueValuesResponse,
  ValueParameters,
} from './value-models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class ValueService {

  constructor(
    private http: HttpClient,
    private tailorMap: TailorMapService,
  ) {
  }

  public uniqueValues$ (params: ValueParameters): Observable<UniqueValuesResponse> {
    let httpParams: HttpParams = new HttpParams();
    Object.entries(params).forEach(([key, value ]) => {
      httpParams = httpParams.set(key, String(value));
    });
    return this.http.post<UniqueValuesResponse>(this.tailorMap.getContextPath() + '/action/uniquevalues', httpParams.toString(),
      {headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')});
  }

}
