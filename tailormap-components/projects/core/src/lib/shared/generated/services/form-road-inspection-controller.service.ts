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

import { PageWeginspectie } from '../models/page-weginspectie';
import { Weginspectie } from '../models/weginspectie';

@Injectable({
  providedIn: 'root',
})
export class FormRoadInspectionControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get10
   */
  static readonly Get10Path = '/weginspectie/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get10()` instead.
   *
   * This method doesn't expect any request body.
   */
  get10$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<Weginspectie>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadInspectionControllerService.Get10Path, 'get');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Weginspectie>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get10$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get10(params: {
    objectGuid: string;
  }): Observable<Weginspectie> {

    return this.get10$Response(params).pipe(
      map((r: StrictHttpResponse<Weginspectie>) => r.body as Weginspectie)
    );
  }

  /**
   * Path part for operation update2
   */
  static readonly Update2Path = '/weginspectie/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update2()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update2$Response(params: {
    objectGuid: string;
    body: Weginspectie
  }): Observable<StrictHttpResponse<Weginspectie>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadInspectionControllerService.Update2Path, 'put');
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
        return r as StrictHttpResponse<Weginspectie>;
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
    body: Weginspectie
  }): Observable<Weginspectie> {

    return this.update2$Response(params).pipe(
      map((r: StrictHttpResponse<Weginspectie>) => r.body as Weginspectie)
    );
  }

  /**
   * Path part for operation delete2
   */
  static readonly Delete2Path = '/weginspectie/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete2()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete2$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadInspectionControllerService.Delete2Path, 'delete');
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
   * Path part for operation getAllPaged1
   */
  static readonly GetAllPaged1Path = '/weginspectie';

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
  }): Observable<StrictHttpResponse<PageWeginspectie>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadInspectionControllerService.GetAllPaged1Path, 'get');
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
        return r as StrictHttpResponse<PageWeginspectie>;
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
  }): Observable<PageWeginspectie> {

    return this.getAllPaged1$Response(params).pipe(
      map((r: StrictHttpResponse<PageWeginspectie>) => r.body as PageWeginspectie)
    );
  }

  /**
   * Path part for operation save2
   */
  static readonly Save2Path = '/weginspectie';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save2()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save2$Response(params: {
    body: { 'wv'?: Weginspectie, 'parentId'?: string }
  }): Observable<StrictHttpResponse<Weginspectie>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadInspectionControllerService.Save2Path, 'post');
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Weginspectie>;
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
    body: { 'wv'?: Weginspectie, 'parentId'?: string }
  }): Observable<Weginspectie> {

    return this.save2$Response(params).pipe(
      map((r: StrictHttpResponse<Weginspectie>) => r.body as Weginspectie)
    );
  }

  /**
   * Path part for operation getAll2
   */
  static readonly GetAll2Path = '/weginspectie/unpaged';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAll2()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll2$Response(params?: {
  }): Observable<StrictHttpResponse<Array<Weginspectie>>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadInspectionControllerService.GetAll2Path, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Weginspectie>>;
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
  }): Observable<Array<Weginspectie>> {

    return this.getAll2$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Weginspectie>>) => r.body as Array<Weginspectie>)
    );
  }

}
