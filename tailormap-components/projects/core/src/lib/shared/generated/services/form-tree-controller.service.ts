/* tslint:disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { Boom } from '../models/boom';

@Injectable({
  providedIn: 'root',
})
export class FormTreeControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get10
   */
  static readonly Get10Path = '/boom/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get10()` instead.
   *
   * This method doesn't expect any request body.
   */
  get10$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<Boom>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreeControllerService.Get10Path, 'get');
    if (params) {

      rb.path('objectGuid', params.objectGuid, {});

    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Boom>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get10$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get10(params: {
    objectGuid: string;

  }): Observable<Boom> {

    return this.get10$Response(params).pipe(
      map((r: StrictHttpResponse<Boom>) => r.body as Boom)
    );
  }

  /**
   * Path part for operation onPoint8
   */
  static readonly OnPoint8Path = '/boom/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint8()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint8$Response(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<StrictHttpResponse<Array<Boom>>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreeControllerService.OnPoint8Path, 'get');
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
        return r as StrictHttpResponse<Array<Boom>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint8$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint8(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<Array<Boom>> {

    return this.onPoint8$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Boom>>) => r.body as Array<Boom>)
    );
  }

}
