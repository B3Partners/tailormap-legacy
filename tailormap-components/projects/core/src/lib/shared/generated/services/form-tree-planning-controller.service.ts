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
   * Path part for operation get15
   */
  static readonly Get15Path = '/boomplanning/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get15()` instead.
   *
   * This method doesn't expect any request body.
   */
  get15$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<Boomplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreePlanningControllerService.Get15Path, 'get');
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
   * To access the full response (for headers, for example), `get15$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get15(params: {
    objectGuid: string;
  }): Observable<Boomplanning> {

    return this.get15$Response(params).pipe(
      map((r: StrictHttpResponse<Boomplanning>) => r.body as Boomplanning)
    );
  }

  /**
   * Path part for operation update6
   */
  static readonly Update6Path = '/boomplanning/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update6()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update6$Response(params: {
    objectGuid: string;
    body: Boomplanning
  }): Observable<StrictHttpResponse<Boomplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreePlanningControllerService.Update6Path, 'put');
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
   * To access the full response (for headers, for example), `update6$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update6(params: {
    objectGuid: string;
    body: Boomplanning
  }): Observable<Boomplanning> {

    return this.update6$Response(params).pipe(
      map((r: StrictHttpResponse<Boomplanning>) => r.body as Boomplanning)
    );
  }

  /**
   * Path part for operation delete6
   */
  static readonly Delete6Path = '/boomplanning/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete6()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete6$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreePlanningControllerService.Delete6Path, 'delete');
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
   * To access the full response (for headers, for example), `delete6$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete6(params: {
    objectGuid: string;
  }): Observable<void> {

    return this.delete6$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

  /**
   * Path part for operation getAllPaged5
   */
  static readonly GetAllPaged5Path = '/boomplanning';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAllPaged5()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPaged5$Response(params?: {

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

    const rb = new RequestBuilder(this.rootUrl, FormTreePlanningControllerService.GetAllPaged5Path, 'get');
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
   * To access the full response (for headers, for example), `getAllPaged5$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPaged5(params?: {

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

    return this.getAllPaged5$Response(params).pipe(
      map((r: StrictHttpResponse<PageBoomplanning>) => r.body as PageBoomplanning)
    );
  }

  /**
   * Path part for operation save6
   */
  static readonly Save6Path = '/boomplanning';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save6()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save6$Response(params: {
    body: { 'wv'?: Boomplanning, 'parentId'?: string }
  }): Observable<StrictHttpResponse<Boomplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreePlanningControllerService.Save6Path, 'post');
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
   * To access the full response (for headers, for example), `save6$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save6(params: {
    body: { 'wv'?: Boomplanning, 'parentId'?: string }
  }): Observable<Boomplanning> {

    return this.save6$Response(params).pipe(
      map((r: StrictHttpResponse<Boomplanning>) => r.body as Boomplanning)
    );
  }

  /**
   * Path part for operation getAll6
   */
  static readonly GetAll6Path = '/boomplanning/unpaged';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAll6()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll6$Response(params?: {
  }): Observable<StrictHttpResponse<Array<Boomplanning>>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreePlanningControllerService.GetAll6Path, 'get');
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
   * To access the full response (for headers, for example), `getAll6$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll6(params?: {
  }): Observable<Array<Boomplanning>> {

    return this.getAll6$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Boomplanning>>) => r.body as Array<Boomplanning>)
    );
  }

}
