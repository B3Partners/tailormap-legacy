import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import {
  ExportFeaturesParameters,
} from './export-models';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';

@Injectable({
  providedIn: 'root',
})
export class ExportService {

  constructor(
    private http: HttpClient,
    private tailorMap: TailorMapService,
  ) {
  }

  public exportFeatures (params: ExportFeaturesParameters): any {
    let httpParams: HttpParams = new HttpParams();
    Object.entries(params).forEach(([key, value ]) => {
      httpParams = httpParams.set(key, String(value));
    });
    return this.http.get (this.tailorMap.getContextPath() + '/action/downloadfeatures', {params: httpParams, responseType: 'blob', observe: 'response'});
  }

}
