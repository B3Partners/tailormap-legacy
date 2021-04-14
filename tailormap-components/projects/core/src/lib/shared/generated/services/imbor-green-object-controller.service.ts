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

import { ImborGroenobject } from '../models/imbor-groenobject';

@Injectable({
  providedIn: 'root',
})
export class ImborGreenObjectControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get18
   */
  static readonly Get18Path = '/imborgroenobject/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get18()` instead.
   *
   * This method doesn't expect any request body.
   */
  get18$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<ImborGroenobject>> {

    const rb = new RequestBuilder(this.rootUrl, ImborGreenObjectControllerService.Get18Path, 'get');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<ImborGroenobject>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get18$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get18(params: {
    objectGuid: string;
  }): Observable<ImborGroenobject> {

    return this.get18$Response(params).pipe(
      map((r: StrictHttpResponse<ImborGroenobject>) => r.body as ImborGroenobject)
    );
  }

  /**
   * Path part for operation onPoint14
   */
  static readonly OnPoint14Path = '/imborgroenobject/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint14()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint14$Response(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<ImborGroenobject>>> {

    const rb = new RequestBuilder(this.rootUrl, ImborGreenObjectControllerService.OnPoint14Path, 'get');
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
        return r as StrictHttpResponse<Array<ImborGroenobject>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint14$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint14(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<ImborGroenobject>> {

    return this.onPoint14$Response(params).pipe(
      map((r: StrictHttpResponse<Array<ImborGroenobject>>) => r.body as Array<ImborGroenobject>)
    );
  }

}
