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

import { Boominspectie } from '../models/boominspectie';
import { PageBoominspectie } from '../models/page-boominspectie';

@Injectable({
  providedIn: 'root',
})
export class FormTreeInspectionControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get14
   */
  static readonly Get14Path = '/boominspectie/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get14()` instead.
   *
   * This method doesn't expect any request body.
   */
  get14$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<Boominspectie>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreeInspectionControllerService.Get14Path, 'get');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Boominspectie>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get14$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get14(params: {
    objectGuid: string;
  }): Observable<Boominspectie> {

    return this.get14$Response(params).pipe(
      map((r: StrictHttpResponse<Boominspectie>) => r.body as Boominspectie)
    );
  }

  /**
   * Path part for operation update5
   */
  static readonly Update5Path = '/boominspectie/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update5()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update5$Response(params: {
    objectGuid: string;
    body: Boominspectie
  }): Observable<StrictHttpResponse<Boominspectie>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreeInspectionControllerService.Update5Path, 'put');
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
        return r as StrictHttpResponse<Boominspectie>;
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
    body: Boominspectie
  }): Observable<Boominspectie> {

    return this.update5$Response(params).pipe(
      map((r: StrictHttpResponse<Boominspectie>) => r.body as Boominspectie)
    );
  }

  /**
   * Path part for operation delete5
   */
  static readonly Delete5Path = '/boominspectie/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete5()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete5$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreeInspectionControllerService.Delete5Path, 'delete');
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
  static readonly GetAllPaged4Path = '/boominspectie';

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
  }): Observable<StrictHttpResponse<PageBoominspectie>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreeInspectionControllerService.GetAllPaged4Path, 'get');
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
        return r as StrictHttpResponse<PageBoominspectie>;
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
  }): Observable<PageBoominspectie> {

    return this.getAllPaged4$Response(params).pipe(
      map((r: StrictHttpResponse<PageBoominspectie>) => r.body as PageBoominspectie)
    );
  }

  /**
   * Path part for operation save5
   */
  static readonly Save5Path = '/boominspectie';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save5()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save5$Response(params: {
    body: { 'wv'?: Boominspectie, 'parentId'?: string }
  }): Observable<StrictHttpResponse<Boominspectie>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreeInspectionControllerService.Save5Path, 'post');
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Boominspectie>;
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
    body: { 'wv'?: Boominspectie, 'parentId'?: string }
  }): Observable<Boominspectie> {

    return this.save5$Response(params).pipe(
      map((r: StrictHttpResponse<Boominspectie>) => r.body as Boominspectie)
    );
  }

  /**
   * Path part for operation getAll5
   */
  static readonly GetAll5Path = '/boominspectie/unpaged';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAll5()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll5$Response(params?: {
  }): Observable<StrictHttpResponse<Array<Boominspectie>>> {

    const rb = new RequestBuilder(this.rootUrl, FormTreeInspectionControllerService.GetAll5Path, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Boominspectie>>;
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
  }): Observable<Array<Boominspectie>> {

    return this.getAll5$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Boominspectie>>) => r.body as Array<Boominspectie>)
    );
  }

}
