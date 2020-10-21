import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import {
  UniqueValuesResponse,
  ValueParameters,
} from './value-models';

@Injectable({
  providedIn: 'root',
})

export class ValueService {

  constructor(private http: HttpClient) {
  }

  public uniqueValues (params: ValueParameters): any {
    let httpParams: HttpParams = new HttpParams();
    Object.entries(params).forEach(([key, value ]) => {
      httpParams = httpParams.set(key, String(value));
    });
    return this.http.get<UniqueValuesResponse>('/viewer/action/uniquevalues', {params: httpParams, observe: 'response'});
  }

}
