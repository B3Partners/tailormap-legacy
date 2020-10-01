/* tslint:disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { NatBeplanting } from '../models/nat-beplanting';

@Injectable({
  providedIn: 'root',
})
export class FormNatPlantingControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get4
   */
  static readonly Get4Path = '/natbeplanting/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get4()` instead.
   *
   * This method doesn't expect any request body.
   */
  get4$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<NatBeplanting>> {

    const rb = new RequestBuilder(this.rootUrl, FormNatPlantingControllerService.Get4Path, 'get');
    if (params) {

      rb.path('objectGuid', params.objectGuid, {});

    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<NatBeplanting>;
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

  }): Observable<NatBeplanting> {

    return this.get4$Response(params).pipe(
      map((r: StrictHttpResponse<NatBeplanting>) => r.body as NatBeplanting)
    );
  }

  /**
   * Path part for operation onPoint4
   */
  static readonly OnPoint4Path = '/natbeplanting/{x}/{y}/{scale}';

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

  }): Observable<StrictHttpResponse<Array<NatBeplanting>>> {

    const rb = new RequestBuilder(this.rootUrl, FormNatPlantingControllerService.OnPoint4Path, 'get');
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
        return r as StrictHttpResponse<Array<NatBeplanting>>;
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

  }): Observable<Array<NatBeplanting>> {

    return this.onPoint4$Response(params).pipe(
      map((r: StrictHttpResponse<Array<NatBeplanting>>) => r.body as Array<NatBeplanting>)
    );
  }

}
