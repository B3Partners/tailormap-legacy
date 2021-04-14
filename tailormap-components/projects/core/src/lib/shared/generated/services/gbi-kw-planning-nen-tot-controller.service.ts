/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { Ikwplanningnentot } from '../models/ikwplanningnentot';

@Injectable({
  providedIn: 'root',
})
export class GbiKwPlanningNenTotControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get17
   */
  static readonly Get17Path = '/gbi_kw_planning_nen_tot/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get17()` instead.
   *
   * This method doesn't expect any request body.
   */
  get17$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<Ikwplanningnentot>> {

    const rb = new RequestBuilder(this.rootUrl, GbiKwPlanningNenTotControllerService.Get17Path, 'get');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Ikwplanningnentot>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get17$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get17(params: {
    objectGuid: string;
  }): Observable<Ikwplanningnentot> {

    return this.get17$Response(params).pipe(
      map((r: StrictHttpResponse<Ikwplanningnentot>) => r.body as Ikwplanningnentot)
    );
  }

  /**
   * Path part for operation onPoint13
   */
  static readonly OnPoint13Path = '/gbi_kw_planning_nen_tot/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint13()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint13$Response(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<Ikwplanningnentot>>> {

    const rb = new RequestBuilder(this.rootUrl, GbiKwPlanningNenTotControllerService.OnPoint13Path, 'get');
    if (params) {
      rb.path('x', params['x'], {});
      rb.path('y', params['y'], {});
      rb.path('scale', params.scale, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Ikwplanningnentot>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint13$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint13(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<Ikwplanningnentot>> {

    return this.onPoint13$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Ikwplanningnentot>>) => r.body as Array<Ikwplanningnentot>)
    );
  }

}
