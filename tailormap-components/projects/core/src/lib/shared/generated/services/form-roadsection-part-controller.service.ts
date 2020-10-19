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
export class FormRoadsectionPartControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get8
   */
  static readonly Get8Path = '/wegvakonderdeel/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get8()` instead.
   *
   * This method doesn't expect any request body.
   */
  get8$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<Wegvakonderdeel>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.Get8Path, 'get');
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
   * To access the full response (for headers, for example), `get8$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get8(params: {
    objectGuid: string;

  }): Observable<Wegvakonderdeel> {

    return this.get8$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeel>) => r.body as Wegvakonderdeel)
    );
  }

  /**
   * Path part for operation update2
   */
  static readonly Update2Path = '/wegvakonderdeel/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update2()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update2$Response(params: {
    objectGuid: string;
      body: Wegvakonderdeel
  }): Observable<StrictHttpResponse<Wegvakonderdeel>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.Update2Path, 'put');
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
   * To access the full response (for headers, for example), `update2$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update2(params: {
    objectGuid: string;
      body: Wegvakonderdeel
  }): Observable<Wegvakonderdeel> {

    return this.update2$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeel>) => r.body as Wegvakonderdeel)
    );
  }

  /**
   * Path part for operation delete2
   */
  static readonly Delete2Path = '/wegvakonderdeel/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete2()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete2$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.Delete2Path, 'delete');
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
   * To access the full response (for headers, for example), `delete2$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete2(params: {
    objectGuid: string;

  }): Observable<void> {

    return this.delete2$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

  /**
   * Path part for operation save2
   */
  static readonly Save2Path = '/wegvakonderdeel';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save2()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save2$Response(params: {
      body: { 'wv'?: Wegvakonderdeel, 'parentId'?: string }
  }): Observable<StrictHttpResponse<Wegvakonderdeel>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.Save2Path, 'post');
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
   * To access the full response (for headers, for example), `save2$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save2(params: {
      body: { 'wv'?: Wegvakonderdeel, 'parentId'?: string }
  }): Observable<Wegvakonderdeel> {

    return this.save2$Response(params).pipe(
      map((r: StrictHttpResponse<Wegvakonderdeel>) => r.body as Wegvakonderdeel)
    );
  }

  /**
   * Path part for operation getAll2
   */
  static readonly GetAll2Path = '/wegvakonderdelen/unpaged';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAll2()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll2$Response(params?: {

  }): Observable<StrictHttpResponse<Array<Wegvakonderdeel>>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.GetAll2Path, 'get');
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
   * To access the full response (for headers, for example), `getAll2$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll2(params?: {

  }): Observable<Array<Wegvakonderdeel>> {

    return this.getAll2$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Wegvakonderdeel>>) => r.body as Array<Wegvakonderdeel>)
    );
  }

  /**
   * Path part for operation getAllPaged1
   */
  static readonly GetAllPaged1Path = '/wegvakonderdelen';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAllPaged1()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPaged1$Response(params?: {

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

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.GetAllPaged1Path, 'get');
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
   * To access the full response (for headers, for example), `getAllPaged1$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPaged1(params?: {

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

    return this.getAllPaged1$Response(params).pipe(
      map((r: StrictHttpResponse<PageWegvakonderdeel>) => r.body as PageWegvakonderdeel)
    );
  }

  /**
   * Path part for operation onPoint7
   */
  static readonly OnPoint7Path = '/wegvakonderdelen/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint7()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint7$Response(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<StrictHttpResponse<Array<Wegvakonderdeel>>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadsectionPartControllerService.OnPoint7Path, 'get');
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
   * To access the full response (for headers, for example), `onPoint7$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint7(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<Array<Wegvakonderdeel>> {

    return this.onPoint7$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Wegvakonderdeel>>) => r.body as Array<Wegvakonderdeel>)
    );
  }

}
