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
   * Path part for operation get8
   */
  static readonly Get8Path = '/boom/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get8()` instead.
   *
   * This method doesn't expect any request body.
   */
  get8$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<Boom>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreeControllerService.Get8Path, 'get');
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
   * To access the full response (for headers, for example), `get8$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get8(params: {
    objectGuid: string;

  }): Observable<Boom> {

    return this.get8$Response(params).pipe(
      map((r: StrictHttpResponse<Boom>) => r.body as Boom)
    );
  }

  /**
   * Path part for operation bomenOnPoint3
   */
  static readonly BomenOnPoint3Path = '/boom/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `bomenOnPoint3()` instead.
   *
   * This method doesn't expect any request body.
   */
  bomenOnPoint3$Response(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<StrictHttpResponse<Array<Boom>>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreeControllerService.BomenOnPoint3Path, 'get');
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
   * To access the full response (for headers, for example), `bomenOnPoint3$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  bomenOnPoint3(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<Array<Boom>> {

    return this.bomenOnPoint3$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Boom>>) => r.body as Array<Boom>)
    );
  }

}
