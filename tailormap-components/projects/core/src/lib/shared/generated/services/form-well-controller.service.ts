/* tslint:disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { Rioolput } from '../models/rioolput';

@Injectable({
  providedIn: 'root',
})
export class FormWellControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get13
   */
  static readonly Get13Path = '/rioolput/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get13()` instead.
   *
   * This method doesn't expect any request body.
   */
  get13$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<Rioolput>> {

    const rb = new RequestBuilder(this.rootUrl, FormWellControllerService.Get13Path, 'get');
    if (params) {

      rb.path('objectGuid', params.objectGuid, {});

    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Rioolput>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get13$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get13(params: {
    objectGuid: string;

  }): Observable<Rioolput> {

    return this.get13$Response(params).pipe(
      map((r: StrictHttpResponse<Rioolput>) => r.body as Rioolput)
    );
  }

  /**
   * Path part for operation onPoint9
   */
  static readonly OnPoint9Path = '/rioolput/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint9()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint9$Response(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<StrictHttpResponse<Array<Rioolput>>> {

    const rb = new RequestBuilder(this.rootUrl, FormWellControllerService.OnPoint9Path, 'get');
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
        return r as StrictHttpResponse<Array<Rioolput>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint9$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint9(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<Array<Rioolput>> {

    return this.onPoint9$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Rioolput>>) => r.body as Array<Rioolput>)
    );
  }

}
