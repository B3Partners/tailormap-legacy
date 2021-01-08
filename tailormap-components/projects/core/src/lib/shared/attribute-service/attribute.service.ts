import { Injectable } from '@angular/core';
import {
  HttpClient, HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import {
  AttributeListParameters,
  AttributeListResponse,
  AttributeMetadataParameters,
  AttributeMetadataResponse,
} from './attribute-models';
import { Observable } from 'rxjs';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';

@Injectable({
  providedIn: 'root',
})
export class AttributeService {

  constructor(
    private http: HttpClient,
    private tailorMap: TailorMapService,
  ) {
  }

  public featureTypeMetadata$(params: AttributeMetadataParameters): Observable<AttributeMetadataResponse> {
    let httpParams: HttpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      httpParams = httpParams.set(key, value);
    });
    httpParams = httpParams.set('attributes', 'true');
    return this.http.get<AttributeMetadataResponse>(this.tailorMap.getContextPath() + '/action/attributes', {params: httpParams});
  }

  /**
   * Get features for the attributelist
   * @param params Params for retrieving, sorting and filtering the features
   */
  public features$(params: AttributeListParameters): Observable<AttributeListResponse> {
    let httpParams: HttpParams = new HttpParams();
    httpParams = httpParams.set('limit', '10');
    httpParams = httpParams.set('page', '1');
    httpParams = httpParams.set('start', '1');

    Object.entries(params).forEach(([key, value]) => {
      httpParams = httpParams.set(key, value);
    });
    httpParams = httpParams.set('store', '1');
    return this.http.post<AttributeListResponse>(this.tailorMap.getContextPath() + '/action/attributes', httpParams.toString(), {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'),
    });
  }
}
