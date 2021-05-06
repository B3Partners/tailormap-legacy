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

import { Feature } from '../models/feature';

@Injectable({
  providedIn: 'root',
})
export class FeatureControllerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation update
   */
  static readonly UpdatePath = '/features/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update$Response(params: {
    objectGuid: string;
    body: Feature
  }): Observable<StrictHttpResponse<Feature>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.UpdatePath, 'put');
    if (params) {
      rb.path('objectGuid', params.objectGuid, {});
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'blob',
      accept: '*/*'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Feature>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `update$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update(params: {
    objectGuid: string;
    body: Feature
  }): Observable<Feature> {

    return this.update$Response(params).pipe(
      map((r: StrictHttpResponse<Feature>) => r.body as Feature)
    );
  }

  /**
   * Path part for operation save
   */
  static readonly SavePath = '/features';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save$Response(params: {
    parentId?: string;
    body: Feature
  }): Observable<StrictHttpResponse<Feature>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.SavePath, 'post');
    if (params) {
      rb.query('parentId', params.parentId, {});
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'blob',
      accept: '*/*'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Feature>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `save$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save(params: {
    parentId?: string;
    body: Feature
  }): Observable<Feature> {

    return this.save$Response(params).pipe(
      map((r: StrictHttpResponse<Feature>) => r.body as Feature)
    );
  }

  /**
   * Path part for operation featuretypeOnPoint
   */
  static readonly FeaturetypeOnPointPath = '/features/{featureTypes}/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `featuretypeOnPoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  featuretypeOnPoint$Response(params: {
    featureTypes: Array<string>;
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<Feature>>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.FeaturetypeOnPointPath, 'get');
    if (params) {
      rb.path('featureTypes', params.featureTypes, {});
      rb.path('x', params['x'], {});
      rb.path('y', params['y'], {});
      rb.path('scale', params.scale, {});
    }

    return this.http.request(rb.build({
      responseType: 'blob',
      accept: '*/*'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Feature>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `featuretypeOnPoint$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  featuretypeOnPoint(params: {
    featureTypes: Array<string>;
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<Feature>> {

    return this.featuretypeOnPoint$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Feature>>) => r.body as Array<Feature>)
    );
  }

  /**
   * Path part for operation onPoint
   */
  static readonly OnPointPath = '/features/{application}/{appLayerId}/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint$Response(params: {
    application: number;
    appLayerId: number;
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<Feature>>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.OnPointPath, 'get');
    if (params) {
      rb.path('application', params.application, {});
      rb.path('appLayerId', params.appLayerId, {});
      rb.path('x', params['x'], {});
      rb.path('y', params['y'], {});
      rb.path('scale', params.scale, {});
    }

    return this.http.request(rb.build({
      responseType: 'blob',
      accept: '*/*'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Feature>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint(params: {
    application: number;
    appLayerId: number;
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<Feature>> {

    return this.onPoint$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Feature>>) => r.body as Array<Feature>)
    );
  }

  /**
   * Path part for operation onPoint1
   */
  static readonly OnPoint1Path = '/features/2/{application}/{appLayerIds}/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint1()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint1$Response(params: {
    application: number;
    appLayerIds: Array<number>;
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<Feature>>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.OnPoint1Path, 'get');
    if (params) {
      rb.path('application', params.application, {});
      rb.path('appLayerIds', params.appLayerIds, {});
      rb.path('x', params['x'], {});
      rb.path('y', params['y'], {});
      rb.path('scale', params.scale, {});
    }

    return this.http.request(rb.build({
      responseType: 'blob',
      accept: '*/*'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Feature>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `onPoint1$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint1(params: {
    application: number;
    appLayerIds: Array<number>;
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<Feature>> {

    return this.onPoint1$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Feature>>) => r.body as Array<Feature>)
    );
  }

  /**
   * Path part for operation delete
   */
  static readonly DeletePath = '/features/{featuretype}/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete$Response(params: {
    featuretype: string;
    objectGuid: string;
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.DeletePath, 'delete');
    if (params) {
      rb.path('featuretype', params.featuretype, {});
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
   * To access the full response (for headers, for example), `delete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete(params: {
    featuretype: string;
    objectGuid: string;
  }): Observable<void> {

    return this.delete$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

}
