/* tslint:disable */
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
export class WegvakonderdeelControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get1
   */
  static readonly Get1Path = '/wegvakonderdeel/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get1()` instead.
   *
   * This method doesn't expect any request body.
   */
  get1$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<Wegvakonderdeel>> {

    const rb = new RequestBuilder(this.rootUrl, WegvakonderdeelControllerService.Get1Path, 'get');
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
   * To access the full response (for headers, for example), `get1$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get1(params: {
    objectGuid: string;

  }): Observable<Wegvakonderdeel> {

    return this.get1$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeel>) => r.body as Wegvakonderdeel)
    );
  }

  /**
   * Path part for operation update1
   */
  static readonly Update1Path = '/wegvakonderdeel/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update1()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update1$Response(params: {
    objectGuid: string;
      body: Wegvakonderdeel
  }): Observable<StrictHttpResponse<Wegvakonderdeel>> {

    const rb = new RequestBuilder(this.rootUrl, WegvakonderdeelControllerService.Update1Path, 'put');
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
   * To access the full response (for headers, for example), `update1$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update1(params: {
    objectGuid: string;
      body: Wegvakonderdeel
  }): Observable<Wegvakonderdeel> {

    return this.update1$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeel>) => r.body as Wegvakonderdeel)
    );
  }

  /**
   * Path part for operation delete1
   */
  static readonly Delete1Path = '/wegvakonderdeel/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete1()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete1$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, WegvakonderdeelControllerService.Delete1Path, 'delete');
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
   * To access the full response (for headers, for example), `delete1$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete1(params: {
    objectGuid: string;

  }): Observable<void> {

    return this.delete1$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

  /**
   * Path part for operation save1
   */
  static readonly Save1Path = '/wegvakonderdeel';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save1()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save1$Response(params: {
      body: { 'wv'?: Wegvakonderdeel, 'parentId'?: string }
  }): Observable<StrictHttpResponse<Wegvakonderdeel>> {

    const rb = new RequestBuilder(this.rootUrl, WegvakonderdeelControllerService.Save1Path, 'post');
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
   * To access the full response (for headers, for example), `save1$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save1(params: {
      body: { 'wv'?: Wegvakonderdeel, 'parentId'?: string }
  }): Observable<Wegvakonderdeel> {

    return this.save1$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeel>) => r.body as Wegvakonderdeel)
    );
  }

  /**
   * Path part for operation getAll1
   */
  static readonly GetAll1Path = '/wegvakonderdelen/unpaged';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAll1()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll1$Response(params?: {

  }): Observable<StrictHttpResponse<Array<Wegvakonderdeel>>> {

    const rb = new RequestBuilder(this.rootUrl, WegvakonderdeelControllerService.GetAll1Path, 'get');
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
   * To access the full response (for headers, for example), `getAll1$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll1(params?: {

  }): Observable<Array<Wegvakonderdeel>> {

    return this.getAll1$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Wegvakonderdeel>>) => r.body as Array<Wegvakonderdeel>)
    );
  }

  /**
   * Path part for operation getAllPaged
   */
  static readonly GetAllPagedPath = '/wegvakonderdelen';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAllPaged()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPaged$Response(params?: {

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

    const rb = new RequestBuilder(this.rootUrl, WegvakonderdeelControllerService.GetAllPagedPath, 'get');
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
   * To access the full response (for headers, for example), `getAllPaged$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPaged(params?: {

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

    return this.getAllPaged$Response(params).pipe(
      map((r: StrictHttpResponse<PageWegvakonderdeel>) => r.body as PageWegvakonderdeel)
    );
  }

  /**
   * Path part for operation wegvakkenOnPoint
   */
  static readonly WegvakkenOnPointPath = '/wegvakonderdelen/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `wegvakkenOnPoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  wegvakkenOnPoint$Response(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<StrictHttpResponse<Array<Wegvakonderdeel>>> {

    const rb = new RequestBuilder(this.rootUrl, WegvakonderdeelControllerService.WegvakkenOnPointPath, 'get');
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
   * To access the full response (for headers, for example), `wegvakkenOnPoint$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  wegvakkenOnPoint(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<Array<Wegvakonderdeel>> {

    return this.wegvakkenOnPoint$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Wegvakonderdeel>>) => r.body as Array<Wegvakonderdeel>)
    );
  }

}
