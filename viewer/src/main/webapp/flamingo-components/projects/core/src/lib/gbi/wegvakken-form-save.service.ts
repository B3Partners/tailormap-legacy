import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Feature } from '../shared/wegvakken-models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WegvakkenFormSaveService {

  constructor(private http: HttpClient) { }

  public save(f: Feature, feature, appLayer: string, applicationId): Observable<any> {
    let params =  new HttpParams();
    if (f.isRelated) {
      params = params.append('saveRelatedFeatures', 'true');
    }

    params = params.append('appLayer', '' + appLayer);
    params = params.append('application', applicationId);
    params = params.append('feature', JSON.stringify(feature));
    return this.http.post<Feature>('/viewer/action/feature/edit', params);
  }

  public savebulk(features: Feature[], appLayer: string, applicationId): Observable<any> {
    let params =  new HttpParams();
    const fs = features.map(f => ({...f.attributes, __fid: f.id}) );
    params = params.append('appLayer', '' + appLayer);
    params = params.append('application', applicationId);
    params = params.append('features', JSON.stringify(fs));
    return this.http.post<Feature>('/viewer/action/feature/editbulk', params);
  }
}
