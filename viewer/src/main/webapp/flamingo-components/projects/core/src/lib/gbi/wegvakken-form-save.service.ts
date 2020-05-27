import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import {Feature} from "../shared/generated";

@Injectable({
  providedIn: 'root',
})
export class WegvakkenFormSaveService {

  constructor(private http: HttpClient) { }

  public save(f: Feature, feature, appLayer: string, applicationId): Observable<any> {
    let params =  new HttpParams();
   /* if (f.isRelated) {
      params = params.append('saveRelatedFeatures', 'true');
    }*/

    params = params.append('appLayer', '' + appLayer);
    params = params.append('application', applicationId);
    params = params.append('feature', JSON.stringify(feature));
    return this.http.post<Feature>('/viewer/action/feature/edit', params);
  }

  public savebulk(features: Feature[], appLayer: string, applicationId): Observable<any> {
    let params =  new HttpParams();
    const fs = features.map(f => ({...f, __fid: f.id}) );
    params = params.append('appLayer', '' + appLayer);
    params = params.append('application', applicationId);
    params = params.append('features', JSON.stringify(fs));
    return this.http.post<Feature>('/viewer/action/feature/editbulk', params);
  }


  public delete(f: Feature, appLayer: string, applicationId): Observable<any> {
    console.error("to be implemented");
    return null;
  /*  const feature = {
      __fid: f.id,
    };

    let params =  new HttpParams();

    if (f.isRelated) {
      params = params.append('removeRelatedFeatures', 'true');
    } else {
      params = params.append('delete', 'true');
    }

    params = params.append('appLayer', '' + appLayer);
    params = params.append('application', applicationId);
    params = params.append('feature', JSON.stringify(feature));
    return this.http.post<Feature>('/viewer/action/feature/edit', params);*/
  }
}
