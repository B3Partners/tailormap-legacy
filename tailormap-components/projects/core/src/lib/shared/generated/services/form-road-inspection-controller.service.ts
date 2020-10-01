/* tslint:disable */
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
   * Path part for operation get7
   */
  static readonly Get7Path = '/weginspectie/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get7()` instead.
   *
   * This method doesn't expect any request body.
   */
  get7$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<Weginspectie>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadInspectionControllerService.Get7Path, 'get');
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
   * To access the full response (for headers, for example), `get7$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get7(params: {
    objectGuid: string;

  }): Observable<Weginspectie> {

    return this.get7$Response(params).pipe(
      map((r: StrictHttpResponse<Weginspectie>) => r.body as Weginspectie)
    );
  }

  /**
   * Path part for operation update1
   */
  static readonly Update1Path = '/weginspectie/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update1()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update1$Response(params: {
    objectGuid: string;
      body: Weginspectie
  }): Observable<StrictHttpResponse<Weginspectie>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadInspectionControllerService.Update1Path, 'put');
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
   * To access the full response (for headers, for example), `update1$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update1(params: {
    objectGuid: string;
      body: Weginspectie
  }): Observable<Weginspectie> {

    return this.update1$Response(params).pipe(
      map((r: StrictHttpResponse<Weginspectie>) => r.body as Weginspectie)
    );
  }

  /**
   * Path part for operation delete1
   */
  static readonly Delete1Path = '/weginspectie/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete1()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete1$Response(params: {
    objectGuid: string;

  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadInspectionControllerService.Delete1Path, 'delete');
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
   * Path part for operation getAllPaged
   */
  static readonly GetAllPagedPath = '/weginspectie';

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

  }): Observable<StrictHttpResponse<PageWeginspectie>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadInspectionControllerService.GetAllPagedPath, 'get');
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

  }): Observable<PageWeginspectie> {

    return this.getAllPaged$Response(params).pipe(
      map((r: StrictHttpResponse<PageWeginspectie>) => r.body as PageWeginspectie)
    );
  }

  /**
   * Path part for operation save1
   */
  static readonly Save1Path = '/weginspectie';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save1()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save1$Response(params: {
      body: { 'wv'?: Weginspectie, 'parentId'?: string }
  }): Observable<StrictHttpResponse<Weginspectie>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadInspectionControllerService.Save1Path, 'post');
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
   * To access the full response (for headers, for example), `save1$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save1(params: {
      body: { 'wv'?: Weginspectie, 'parentId'?: string }
  }): Observable<Weginspectie> {

    return this.save1$Response(params).pipe(
      map((r: StrictHttpResponse<Weginspectie>) => r.body as Weginspectie)
    );
  }

  /**
   * Path part for operation getAll1
   */
  static readonly GetAll1Path = '/weginspectie/unpaged';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAll1()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll1$Response(params?: {

  }): Observable<StrictHttpResponse<Array<Weginspectie>>> {

    const rb = new RequestBuilder(this.rootUrl, FormRoadInspectionControllerService.GetAll1Path, 'get');
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
   * To access the full response (for headers, for example), `getAll1$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll1(params?: {

  }): Observable<Array<Weginspectie>> {

    return this.getAll1$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Weginspectie>>) => r.body as Array<Weginspectie>)
    );
  }

}
