/* tslint:disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { Boomplanning } from '../models/boomplanning';
import { PageBoomplanning } from '../models/page-boomplanning';

@Injectable({
  providedIn: 'root',
})
export class FormTreePlanningControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get12
   */
  static readonly Get12Path = '/boomplanning/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get12()` instead.
   *
   * This method doesn't expect any request body.
   */
  get12$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<Boomplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreePlanningControllerService.Get12Path, 'get');
    if (params) {

      rb.path('objectGuid', params.objectGuid, {});

    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Boomplanning>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get12$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get12(params: {
    objectGuid: string;

  }): Observable<Boomplanning> {

    return this.get12$Response(params).pipe(
      map((r: StrictHttpResponse<Boomplanning>) => r.body as Boomplanning)
    );
  }

  /**
   * Path part for operation update5
   */
  static readonly Update5Path = '/boomplanning/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update5()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update5$Response(params: {
    objectGuid: string;
      body: Boomplanning
  }): Observable<StrictHttpResponse<Boomplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreePlanningControllerService.Update5Path, 'put');
    if (params) {

      rb.path('objectGuid', params.objectGuid, {});

      rb.body(params.body, 'application/json');
    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Boomplanning>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `update5$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update5(params: {
    objectGuid: string;
      body: Boomplanning
  }): Observable<Boomplanning> {

    return this.update5$Response(params).pipe(
      map((r: StrictHttpResponse<Boomplanning>) => r.body as Boomplanning)
    );
  }

  /**
   * Path part for operation delete5
   */
  static readonly Delete5Path = '/boomplanning/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete5()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete5$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreePlanningControllerService.Delete5Path, 'delete');
    if (params) {

      rb.path('objectGuid', params.objectGuid, {});

    }
    return this.http.request(rb.build({
      responseType: 'text',
      accept: '*/*'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `delete5$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete5(params: {
    objectGuid: string;

  }): Observable<void> {

    return this.delete5$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

  /**
   * Path part for operation getAllPaged4
   */
  static readonly GetAllPaged4Path = '/boomplanning';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAllPaged4()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPaged4$Response(params?: {

    /**
     * Zero-based page index (0..N)
     */
    page?: number;

    /**
     * The size of the page to be returned
     */
    size?: number;

    /**
     * Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     */
    sort?: Array<string>;

  }): Observable<StrictHttpResponse<PageBoomplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreePlanningControllerService.GetAllPaged4Path, 'get');
    if (params) {

      rb.query('page', params.page, {});
      rb.query('size', params.size, {});
      rb.query('sort', params.sort, {});

    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<PageBoomplanning>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `getAllPaged4$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPaged4(params?: {

    /**
     * Zero-based page index (0..N)
     */
    page?: number;

    /**
     * The size of the page to be returned
     */
    size?: number;

    /**
     * Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     */
    sort?: Array<string>;

  }): Observable<PageBoomplanning> {

    return this.getAllPaged4$Response(params).pipe(
      map((r: StrictHttpResponse<PageBoomplanning>) => r.body as PageBoomplanning)
    );
  }

  /**
   * Path part for operation save5
   */
  static readonly Save5Path = '/boomplanning';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save5()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save5$Response(params: {
      body: { 'wv'?: Boomplanning, 'parentId'?: string }
  }): Observable<StrictHttpResponse<Boomplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreePlanningControllerService.Save5Path, 'post');
    if (params) {


      rb.body(params.body, 'application/json');
    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Boomplanning>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `save5$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save5(params: {
      body: { 'wv'?: Boomplanning, 'parentId'?: string }
  }): Observable<Boomplanning> {

    return this.save5$Response(params).pipe(
      map((r: StrictHttpResponse<Boomplanning>) => r.body as Boomplanning)
    );
  }

  /**
   * Path part for operation getAll5
   */
  static readonly GetAll5Path = '/boomplanning/unpaged';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAll5()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll5$Response(params?: {

  }): Observable<StrictHttpResponse<Array<Boomplanning>>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreePlanningControllerService.GetAll5Path, 'get');
    if (params) {


    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Boomplanning>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `getAll5$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll5(params?: {

  }): Observable<Array<Boomplanning>> {

    return this.getAll5$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Boomplanning>>) => r.body as Array<Boomplanning>)
    );
  }

}
