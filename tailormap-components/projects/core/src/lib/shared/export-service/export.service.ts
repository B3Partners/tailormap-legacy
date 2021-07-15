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
import { ExportServiceModel } from '@tailormap/models';

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
    let httpParams: HttpParams = new HttpParams();
    Object.entries(params).forEach(([key, value ]) => {
      httpParams = httpParams.set(key, String(value));
    });
    return this.http.get(this.tailorMap.getContextPath() + '/action/downloadfeatures', {
      params: httpParams,
      responseType: 'blob',
      observe: 'response',
    });
  }

}
