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
   * Path part for operation get8
   */
  static readonly Get8Path = '/natbeplanting/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get8()` instead.
   *
   * This method doesn't expect any request body.
   */
  get8$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<NatBeplanting>> {

    const rb = new RequestBuilder(this.rootUrl, FormNatPlantingControllerService.Get8Path, 'get');
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
   * To access the full response (for headers, for example), `get8$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get8(params: {
    objectGuid: string;
  }): Observable<NatBeplanting> {

    return this.get8$Response(params).pipe(
      map((r: StrictHttpResponse<NatBeplanting>) => r.body as NatBeplanting)
    );
  }

  /**
   * Path part for operation onPoint8
   */
  static readonly OnPoint8Path = '/natbeplanting/{x}/{y}/{scale}';

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
  }): Observable<StrictHttpResponse<Array<NatBeplanting>>> {

    const rb = new RequestBuilder(this.rootUrl, FormNatPlantingControllerService.OnPoint8Path, 'get');
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
   * To access the full response (for headers, for example), `onPoint8$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint8(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<NatBeplanting>> {

    return this.onPoint8$Response(params).pipe(
      map((r: StrictHttpResponse<Array<NatBeplanting>>) => r.body as Array<NatBeplanting>)
    );
  }

}
