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

import { KunstwerkPlanning } from '../models/kunstwerk-planning';

@Injectable({
  providedIn: 'root',
})
export class FormArtificialWorkPartControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get2
   */
  static readonly Get2Path = '/kunstwerkdeel/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get2()` instead.
   *
   * This method doesn't expect any request body.
   */
  get2$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<KunstwerkPlanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormArtificialWorkPartControllerService.Get2Path, 'get');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<KunstwerkPlanning>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get2$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get2(params: {
    objectGuid: string;
  }): Observable<KunstwerkPlanning> {

    return this.get2$Response(params).pipe(
      map((r: StrictHttpResponse<KunstwerkPlanning>) => r.body as KunstwerkPlanning)
    );
  }

  /**
   * Path part for operation onPoint2
   */
  static readonly OnPoint2Path = '/kunstwerkdeel/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint2()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint2$Response(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<KunstwerkPlanning>>> {

    const rb = new RequestBuilder(this.rootUrl, FormArtificialWorkPartControllerService.OnPoint2Path, 'get');
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
        return r as StrictHttpResponse<Array<KunstwerkPlanning>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint2$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint2(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<KunstwerkPlanning>> {

    return this.onPoint2$Response(params).pipe(
      map((r: StrictHttpResponse<Array<KunstwerkPlanning>>) => r.body as Array<KunstwerkPlanning>)
    );
  }

}
