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

import { PagePlantenbak } from '../models/page-plantenbak';
import { Plantenbak } from '../models/plantenbak';

@Injectable({
  providedIn: 'root',
})
export class FormPlanterControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation get9
   */
  static readonly Get9Path = '/plantenbak/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get9()` instead.
   *
   * This method doesn't expect any request body.
   */
  get9$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<Plantenbak>> {

    const rb = new RequestBuilder(this.rootUrl, FormPlanterControllerService.Get9Path, 'get');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Plantenbak>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get9$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get9(params: {
    objectGuid: string;
  }): Observable<Plantenbak> {

    return this.get9$Response(params).pipe(
      map((r: StrictHttpResponse<Plantenbak>) => r.body as Plantenbak)
    );
  }

  /**
   * Path part for operation update1
   */
  static readonly Update1Path = '/plantenbak/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update1()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update1$Response(params: {
    objectGuid: string;
    body: Plantenbak
  }): Observable<StrictHttpResponse<Plantenbak>> {

    const rb = new RequestBuilder(this.rootUrl, FormPlanterControllerService.Update1Path, 'put');
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
        return r as StrictHttpResponse<Plantenbak>;
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
    body: Plantenbak
  }): Observable<Plantenbak> {

    return this.update1$Response(params).pipe(
      map((r: StrictHttpResponse<Plantenbak>) => r.body as Plantenbak)
    );
  }

  /**
   * Path part for operation delete1
   */
  static readonly Delete1Path = '/plantenbak/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete1()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete1$Response(params: {
    objectGuid: string;
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FormPlanterControllerService.Delete1Path, 'delete');
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
  static readonly Save1Path = '/plantenbak';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save1()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save1$Response(params: {
    body: { 'wv'?: Plantenbak, 'parentId'?: string }
  }): Observable<StrictHttpResponse<Plantenbak>> {

    const rb = new RequestBuilder(this.rootUrl, FormPlanterControllerService.Save1Path, 'post');
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Plantenbak>;
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
    body: { 'wv'?: Plantenbak, 'parentId'?: string }
  }): Observable<Plantenbak> {

    return this.save1$Response(params).pipe(
      map((r: StrictHttpResponse<Plantenbak>) => r.body as Plantenbak)
    );
  }

  /**
   * Path part for operation getAll1
   */
  static readonly GetAll1Path = '/plantenbakken/unpaged';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAll1()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll1$Response(params?: {
  }): Observable<StrictHttpResponse<Array<Plantenbak>>> {

    const rb = new RequestBuilder(this.rootUrl, FormPlanterControllerService.GetAll1Path, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Plantenbak>>;
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
  }): Observable<Array<Plantenbak>> {

    return this.getAll1$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Plantenbak>>) => r.body as Array<Plantenbak>)
    );
  }

  /**
   * Path part for operation onPoint9
   */
  static readonly OnPoint9Path = '/plantenbakken/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint9()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint9$Response(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<Plantenbak>>> {

    const rb = new RequestBuilder(this.rootUrl, FormPlanterControllerService.OnPoint9Path, 'get');
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
        return r as StrictHttpResponse<Array<Plantenbak>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint9$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint9(params: {
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<Plantenbak>> {

    return this.onPoint9$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Plantenbak>>) => r.body as Array<Plantenbak>)
    );
  }

  /**
   * Path part for operation getAllPaged
   */
  static readonly GetAllPagedPath = '/plantenbakken';

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
  }): Observable<StrictHttpResponse<PagePlantenbak>> {

    const rb = new RequestBuilder(this.rootUrl, FormPlanterControllerService.GetAllPagedPath, 'get');
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
        return r as StrictHttpResponse<PagePlantenbak>;
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
  }): Observable<PagePlantenbak> {

    return this.getAllPaged$Response(params).pipe(
      map((r: StrictHttpResponse<PagePlantenbak>) => r.body as PagePlantenbak)
    );
  }

}
