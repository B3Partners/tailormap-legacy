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

import { ImborBoom } from '../models/imbor-boom';

@Injectable({
  providedIn: 'root',
})
export class ImborTreeControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get20
   */
  static readonly Get20Path = '/imborboom/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get20()` instead.
   *
   * This method doesn't expect any request body.
   */
  get20$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<ImborBoom>> {

    const rb = new RequestBuilder(this.rootUrl, ImborTreeControllerService.Get20Path, 'get');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<ImborBoom>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get20$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get20(params: {
    objectGuid: string;
  }): Observable<ImborBoom> {

    return this.get20$Response(params).pipe(
      map((r: StrictHttpResponse<ImborBoom>) => r.body as ImborBoom)
    );
  }

  /**
   * Path part for operation onPoint16
   */
  static readonly OnPoint16Path = '/imborboom/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint16()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint16$Response(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<ImborBoom>>> {

    const rb = new RequestBuilder(this.rootUrl, ImborTreeControllerService.OnPoint16Path, 'get');
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
        return r as StrictHttpResponse<Array<ImborBoom>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint16$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint16(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<ImborBoom>> {

    return this.onPoint16$Response(params).pipe(
      map((r: StrictHttpResponse<Array<ImborBoom>>) => r.body as Array<ImborBoom>)
    );
  }

}
