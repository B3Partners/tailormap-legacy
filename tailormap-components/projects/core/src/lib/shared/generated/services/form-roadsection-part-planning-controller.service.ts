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

import { PageWegvakonderdeelplanning } from '../models/page-wegvakonderdeelplanning';
import { Wegvakonderdeelplanning } from '../models/wegvakonderdeelplanning';

@Injectable({
  providedIn: 'root',
})
export class FormRoadsectionPartPlanningControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get12
   */
  static readonly Get12Path = '/wegvakonderdeelplanning/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get12()` instead.
   *
   * This method doesn't expect any request body.
   */
  get12$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<Wegvakonderdeelplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartPlanningControllerService.Get12Path, 'get');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Wegvakonderdeelplanning>;
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
  }): Observable<Wegvakonderdeelplanning> {

    return this.get12$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeelplanning>) => r.body as Wegvakonderdeelplanning)
    );
  }

  /**
   * Path part for operation update4
   */
  static readonly Update4Path = '/wegvakonderdeelplanning/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update4()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update4$Response(params: {
    objectGuid: string;
    body: Wegvakonderdeelplanning
  }): Observable<StrictHttpResponse<Wegvakonderdeelplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartPlanningControllerService.Update4Path, 'put');
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
        return r as StrictHttpResponse<Wegvakonderdeelplanning>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `update4$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update4(params: {
    objectGuid: string;
    body: Wegvakonderdeelplanning
  }): Observable<Wegvakonderdeelplanning> {

    return this.update4$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeelplanning>) => r.body as Wegvakonderdeelplanning)
    );
  }

  /**
   * Path part for operation delete4
   */
  static readonly Delete4Path = '/wegvakonderdeelplanning/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete4()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete4$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartPlanningControllerService.Delete4Path, 'delete');
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
   * To access the full response (for headers, for example), `delete4$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete4(params: {
    objectGuid: string;
  }): Observable<void> {

    return this.delete4$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

  /**
   * Path part for operation getAllPaged3
   */
  static readonly GetAllPaged3Path = '/wegvakonderdeelplanning';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAllPaged3()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPaged3$Response(params?: {

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
  }): Observable<StrictHttpResponse<PageWegvakonderdeelplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartPlanningControllerService.GetAllPaged3Path, 'get');
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
        return r as StrictHttpResponse<PageWegvakonderdeelplanning>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `getAllPaged3$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPaged3(params?: {

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
  }): Observable<PageWegvakonderdeelplanning> {

    return this.getAllPaged3$Response(params).pipe(
      map((r: StrictHttpResponse<PageWegvakonderdeelplanning>) => r.body as PageWegvakonderdeelplanning)
    );
  }

  /**
   * Path part for operation save4
   */
  static readonly Save4Path = '/wegvakonderdeelplanning';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save4()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save4$Response(params: {
    body: { 'wv'?: Wegvakonderdeelplanning, 'parentId'?: string }
  }): Observable<StrictHttpResponse<Wegvakonderdeelplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartPlanningControllerService.Save4Path, 'post');
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Wegvakonderdeelplanning>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `save4$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save4(params: {
    body: { 'wv'?: Wegvakonderdeelplanning, 'parentId'?: string }
  }): Observable<Wegvakonderdeelplanning> {

    return this.save4$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeelplanning>) => r.body as Wegvakonderdeelplanning)
    );
  }

  /**
   * Path part for operation getAll4
   */
  static readonly GetAll4Path = '/wegvakonderdeelplanning/unpaged';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAll4()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll4$Response(params?: {
  }): Observable<StrictHttpResponse<Array<Wegvakonderdeelplanning>>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartPlanningControllerService.GetAll4Path, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Wegvakonderdeelplanning>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `getAll4$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll4(params?: {
  }): Observable<Array<Wegvakonderdeelplanning>> {

    return this.getAll4$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Wegvakonderdeelplanning>>) => r.body as Array<Wegvakonderdeelplanning>)
    );
  }

}
