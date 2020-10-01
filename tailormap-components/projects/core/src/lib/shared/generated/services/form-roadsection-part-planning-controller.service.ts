/* tslint:disable */
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
   * Path part for operation get7
   */
  static readonly Get7Path = '/wegvakonderdeelplanning/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get7()` instead.
   *
   * This method doesn't expect any request body.
   */
  get7$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<Wegvakonderdeelplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartPlanningControllerService.Get7Path, 'get');
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
   * To access the full response (for headers, for example), `get7$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get7(params: {
    objectGuid: string;

  }): Observable<Wegvakonderdeelplanning> {

    return this.get7$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeelplanning>) => r.body as Wegvakonderdeelplanning)
    );
  }

  /**
   * Path part for operation update3
   */
  static readonly Update3Path = '/wegvakonderdeelplanning/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update3()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update3$Response(params: {
    objectGuid: string;
      body: Wegvakonderdeelplanning
  }): Observable<StrictHttpResponse<Wegvakonderdeelplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartPlanningControllerService.Update3Path, 'put');
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
   * To access the full response (for headers, for example), `update3$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update3(params: {
    objectGuid: string;
      body: Wegvakonderdeelplanning
  }): Observable<Wegvakonderdeelplanning> {

    return this.update3$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeelplanning>) => r.body as Wegvakonderdeelplanning)
    );
  }

  /**
   * Path part for operation delete3
   */
  static readonly Delete3Path = '/wegvakonderdeelplanning/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete3()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete3$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartPlanningControllerService.Delete3Path, 'delete');
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
   * To access the full response (for headers, for example), `delete3$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete3(params: {
    objectGuid: string;

  }): Observable<void> {

    return this.delete3$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

  /**
   * Path part for operation getAllPaged2
   */
  static readonly GetAllPaged2Path = '/wegvakonderdeelplanning';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAllPaged2()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPaged2$Response(params?: {

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

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartPlanningControllerService.GetAllPaged2Path, 'get');
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
   * To access the full response (for headers, for example), `getAllPaged2$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPaged2(params?: {

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

    return this.getAllPaged2$Response(params).pipe(
      map((r: StrictHttpResponse<PageWegvakonderdeelplanning>) => r.body as PageWegvakonderdeelplanning)
    );
  }

  /**
   * Path part for operation save3
   */
  static readonly Save3Path = '/wegvakonderdeelplanning';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save3()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save3$Response(params: {
      body: { 'wv'?: Wegvakonderdeelplanning, 'parentId'?: string }
  }): Observable<StrictHttpResponse<Wegvakonderdeelplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartPlanningControllerService.Save3Path, 'post');
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
   * To access the full response (for headers, for example), `save3$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save3(params: {
      body: { 'wv'?: Wegvakonderdeelplanning, 'parentId'?: string }
  }): Observable<Wegvakonderdeelplanning> {

    return this.save3$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeelplanning>) => r.body as Wegvakonderdeelplanning)
    );
  }

  /**
   * Path part for operation getAll3
   */
  static readonly GetAll3Path = '/wegvakonderdeelplanning/unpaged';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAll3()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll3$Response(params?: {

  }): Observable<StrictHttpResponse<Array<Wegvakonderdeelplanning>>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartPlanningControllerService.GetAll3Path, 'get');
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
   * To access the full response (for headers, for example), `getAll3$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll3(params?: {

  }): Observable<Array<Wegvakonderdeelplanning>> {

    return this.getAll3$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Wegvakonderdeelplanning>>) => r.body as Array<Wegvakonderdeelplanning>)
    );
  }

}
