/* tslint:disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { Attribuut } from '../models/attribuut';

@Injectable({
  providedIn: 'root',
})
export class AttribuutControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation attributes
   */
  static readonly AttributesPath = '/attributes/{ids}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `attributes()` instead.
   *
   * This method doesn't expect any request body.
   */
  attributes$Response(params: {
    ids: Array<number>;

  }): Observable<StrictHttpResponse<Array<Attribuut>>> {

    const rb = new RequestBuilder(this.rootUrl, AttribuutControllerService.AttributesPath, 'get');
    if (params) {

      rb.path('ids', params.ids, {});

    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Attribuut>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `attributes$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  attributes(params: {
    ids: Array<number>;

  }): Observable<Array<Attribuut>> {

    return this.attributes$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Attribuut>>) => r.body as Array<Attribuut>)
    );
  }

}
