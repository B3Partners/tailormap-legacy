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

import { PageWegvakonderdeel } from '../models/page-wegvakonderdeel';
import { Wegvakonderdeel } from '../models/wegvakonderdeel';

@Injectable({
  providedIn: 'root',
})
export class FormRoadsectionPartControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get11
   */
  static readonly Get11Path = '/wegvakonderdeel/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get11()` instead.
   *
   * This method doesn't expect any request body.
   */
  get11$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<Wegvakonderdeel>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.Get11Path, 'get');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Wegvakonderdeel>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get11$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get11(params: {
    objectGuid: string;
  }): Observable<Wegvakonderdeel> {

    return this.get11$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeel>) => r.body as Wegvakonderdeel)
    );
  }

  /**
   * Path part for operation update3
   */
  static readonly Update3Path = '/wegvakonderdeel/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update3()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update3$Response(params: {
    objectGuid: string;
    body: Wegvakonderdeel
  }): Observable<StrictHttpResponse<Wegvakonderdeel>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.Update3Path, 'put');
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
        return r as StrictHttpResponse<Wegvakonderdeel>;
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
    body: Wegvakonderdeel
  }): Observable<Wegvakonderdeel> {

    return this.update3$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeel>) => r.body as Wegvakonderdeel)
    );
  }

  /**
   * Path part for operation delete3
   */
  static readonly Delete3Path = '/wegvakonderdeel/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete3()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete3$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.Delete3Path, 'delete');
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
   * Path part for operation save3
   */
  static readonly Save3Path = '/wegvakonderdeel';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save3()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save3$Response(params: {
    body: { 'wv'?: Wegvakonderdeel, 'parentId'?: string }
  }): Observable<StrictHttpResponse<Wegvakonderdeel>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.Save3Path, 'post');
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Wegvakonderdeel>;
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
    body: { 'wv'?: Wegvakonderdeel, 'parentId'?: string }
  }): Observable<Wegvakonderdeel> {

    return this.save3$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeel>) => r.body as Wegvakonderdeel)
    );
  }

  /**
   * Path part for operation getAll3
   */
  static readonly GetAll3Path = '/wegvakonderdelen/unpaged';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAll3()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll3$Response(params?: {
  }): Observable<StrictHttpResponse<Array<Wegvakonderdeel>>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.GetAll3Path, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Wegvakonderdeel>>;
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
  }): Observable<Array<Wegvakonderdeel>> {

    return this.getAll3$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Wegvakonderdeel>>) => r.body as Array<Wegvakonderdeel>)
    );
  }

  /**
   * Path part for operation onPoint10
   */
  static readonly OnPoint10Path = '/wegvakonderdelen/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint10()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint10$Response(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<Wegvakonderdeel>>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.OnPoint10Path, 'get');
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
        return r as StrictHttpResponse<Array<Wegvakonderdeel>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint10$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint10(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<Wegvakonderdeel>> {

    return this.onPoint10$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Wegvakonderdeel>>) => r.body as Array<Wegvakonderdeel>)
    );
  }

  /**
   * Path part for operation getAllPaged2
   */
  static readonly GetAllPaged2Path = '/wegvakonderdelen';

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
  }): Observable<StrictHttpResponse<PageWegvakonderdeel>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.GetAllPaged2Path, 'get');
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
        return r as StrictHttpResponse<PageWegvakonderdeel>;
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
  }): Observable<PageWegvakonderdeel> {

    return this.getAllPaged2$Response(params).pipe(
      map((r: StrictHttpResponse<PageWegvakonderdeel>) => r.body as PageWegvakonderdeel)
    );
  }

}
