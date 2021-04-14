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

import { ImborVerhardingsobject } from '../models/imbor-verhardingsobject';

@Injectable({
  providedIn: 'root',
})
export class ImborHardeningObjectControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get19
   */
  static readonly Get19Path = '/imborverhardingsobject/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get19()` instead.
   *
   * This method doesn't expect any request body.
   */
  get19$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<ImborVerhardingsobject>> {

    const rb = new RequestBuilder(this.rootUrl, ImborHardeningObjectControllerService.Get19Path, 'get');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<ImborVerhardingsobject>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get19$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get19(params: {
    objectGuid: string;
  }): Observable<ImborVerhardingsobject> {

    return this.get19$Response(params).pipe(
      map((r: StrictHttpResponse<ImborVerhardingsobject>) => r.body as ImborVerhardingsobject)
    );
  }

  /**
   * Path part for operation onPoint15
   */
  static readonly OnPoint15Path = '/imborverhardingsobject/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint15()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint15$Response(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<ImborVerhardingsobject>>> {

    const rb = new RequestBuilder(this.rootUrl, ImborHardeningObjectControllerService.OnPoint15Path, 'get');
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
        return r as StrictHttpResponse<Array<ImborVerhardingsobject>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint15$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint15(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<ImborVerhardingsobject>> {

    return this.onPoint15$Response(params).pipe(
      map((r: StrictHttpResponse<Array<ImborVerhardingsobject>>) => r.body as Array<ImborVerhardingsobject>)
    );
  }

}
