import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import {
  ExportFeaturesParameters,
} from './export-models';

@Injectable({
  providedIn: 'root',
})
export class ExportService {

  constructor(private http: HttpClient) {
  }

  public exportFeatures (params: ExportFeaturesParameters): any {
    let httpParams: HttpParams = new HttpParams();
    Object.entries(params).forEach(([key, value ]) => {
      httpParams = httpParams.set(key, String(value));
    });
    return this.http.get ('/viewer/action/downloadfeatures', {params: httpParams, responseType: 'blob', observe: 'response'});
  }

}
