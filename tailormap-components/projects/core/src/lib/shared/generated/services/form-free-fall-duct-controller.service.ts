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

import { VrijvLeiding } from '../models/vrijv-leiding';

@Injectable({
  providedIn: 'root',
})
export class FormFreeFallDuctControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get4
   */
  static readonly Get4Path = '/vrijevervalleiding/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get4()` instead.
   *
   * This method doesn't expect any request body.
   */
  get4$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<VrijvLeiding>> {

    const rb = new RequestBuilder(this.rootUrl, FormFreeFallDuctControllerService.Get4Path, 'get');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<VrijvLeiding>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get4$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get4(params: {
    objectGuid: string;
  }): Observable<VrijvLeiding> {

    return this.get4$Response(params).pipe(
      map((r: StrictHttpResponse<VrijvLeiding>) => r.body as VrijvLeiding)
    );
  }

  /**
   * Path part for operation onPoint4
   */
  static readonly OnPoint4Path = '/vrijevervalleiding/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint4()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint4$Response(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<VrijvLeiding>>> {

    const rb = new RequestBuilder(this.rootUrl, FormFreeFallDuctControllerService.OnPoint4Path, 'get');
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
        return r as StrictHttpResponse<Array<VrijvLeiding>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint4$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint4(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<VrijvLeiding>> {

    return this.onPoint4$Response(params).pipe(
      map((r: StrictHttpResponse<Array<VrijvLeiding>>) => r.body as Array<VrijvLeiding>)
    );
  }

}
