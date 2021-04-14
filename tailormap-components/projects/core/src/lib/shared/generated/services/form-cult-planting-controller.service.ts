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

import { CultBeplanting } from '../models/cult-beplanting';

@Injectable({
  providedIn: 'root',
})
export class FormCultPlantingControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get3
   */
  static readonly Get3Path = '/cultbeplanting/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get3()` instead.
   *
   * This method doesn't expect any request body.
   */
  get3$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<CultBeplanting>> {

    const rb = new RequestBuilder(this.rootUrl, FormCultPlantingControllerService.Get3Path, 'get');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<CultBeplanting>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get3$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get3(params: {
    objectGuid: string;
  }): Observable<CultBeplanting> {

    return this.get3$Response(params).pipe(
      map((r: StrictHttpResponse<CultBeplanting>) => r.body as CultBeplanting)
    );
  }

  /**
   * Path part for operation onPoint3
   */
  static readonly OnPoint3Path = '/cultbeplanting/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint3()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint3$Response(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<CultBeplanting>>> {

    const rb = new RequestBuilder(this.rootUrl, FormCultPlantingControllerService.OnPoint3Path, 'get');
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
        return r as StrictHttpResponse<Array<CultBeplanting>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint3$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint3(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<CultBeplanting>> {

    return this.onPoint3$Response(params).pipe(
      map((r: StrictHttpResponse<Array<CultBeplanting>>) => r.body as Array<CultBeplanting>)
    );
  }

}
