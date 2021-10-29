import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams, HttpResponse,
} from '@angular/common/http';
import {
  ExportFeaturesParameters,
} from './export-models';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { Observable } from 'rxjs';
import { ExportServiceModel } from '@tailormap/api';

@Injectable({
  providedIn: 'root',
})
export class ExportService implements ExportServiceModel {

  constructor(
    private http: HttpClient,
    private tailorMap: TailorMapService,
  ) {
  }

  public exportFeatures$(params: ExportFeaturesParameters): Observable<HttpResponse<Blob>> {
    const httpParams: FormData = new FormData();
    Object.entries(params).forEach(([key, value ]) => {
      httpParams.set(key, String(value));
    });
    return this.http.post(this.tailorMap.getContextPath() + '/action/downloadfeatures', httpParams,{
      responseType: 'blob',
      observe: 'response',
    });
  }

}
