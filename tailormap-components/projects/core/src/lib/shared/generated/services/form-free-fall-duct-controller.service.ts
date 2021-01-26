/* tslint:disable */
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
   * Path part for operation get2
   */
  static readonly Get2Path = '/vrijevervalleiding/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get2()` instead.
   *
   * This method doesn't expect any request body.
   */
  get2$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<VrijvLeiding>> {

    const rb = new RequestBuilder(this.rootUrl, FormFreeFallDuctControllerService.Get2Path, 'get');
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
   * To access the full response (for headers, for example), `get2$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get2(params: {
    objectGuid: string;

  }): Observable<VrijvLeiding> {

    return this.get2$Response(params).pipe(
      map((r: StrictHttpResponse<VrijvLeiding>) => r.body as VrijvLeiding)
    );
  }

  /**
   * Path part for operation onPoint2
   */
  static readonly OnPoint2Path = '/vrijevervalleiding/{x}/{y}/{scale}';

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

  }): Observable<StrictHttpResponse<Array<VrijvLeiding>>> {

    const rb = new RequestBuilder(this.rootUrl, FormFreeFallDuctControllerService.OnPoint2Path, 'get');
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
   * To access the full response (for headers, for example), `onPoint2$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint2(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<Array<VrijvLeiding>> {

    return this.onPoint2$Response(params).pipe(
      map((r: StrictHttpResponse<Array<VrijvLeiding>>) => r.body as Array<VrijvLeiding>)
    );
  }

}
