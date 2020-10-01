/* tslint:disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { Gras } from '../models/gras';

@Injectable({
  providedIn: 'root',
})
export class FormGrassControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get3
   */
  static readonly Get3Path = '/gras/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get3()` instead.
   *
   * This method doesn't expect any request body.
   */
  get3$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<Gras>> {

    const rb = new RequestBuilder(this.rootUrl, FormGrassControllerService.Get3Path, 'get');
    if (params) {

      rb.path('objectGuid', params.objectGuid, {});

    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Gras>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get3$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get3(params: {
    objectGuid: string;

  }): Observable<Gras> {

    return this.get3$Response(params).pipe(
      map((r: StrictHttpResponse<Gras>) => r.body as Gras)
    );
  }

  /**
   * Path part for operation onPoint3
   */
  static readonly OnPoint3Path = '/gras/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint3()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint3$Response(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<StrictHttpResponse<Array<Gras>>> {

    const rb = new RequestBuilder(this.rootUrl, FormGrassControllerService.OnPoint3Path, 'get');
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
        return r as StrictHttpResponse<Array<Gras>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint3$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint3(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<Array<Gras>> {

    return this.onPoint3$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Gras>>) => r.body as Array<Gras>)
    );
  }

}
