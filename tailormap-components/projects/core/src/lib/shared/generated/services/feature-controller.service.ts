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
import { FeaturetypeMetadata } from '../models/featuretype-metadata';

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
  static readonly UpdatePath = '/features/{application}/{featuretype}/{fid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update$Response(params: {
    application: number;
    featuretype: string;
    fid: string;
    body: Feature
  }): Observable<StrictHttpResponse<Feature>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.UpdatePath, 'put');
    if (params) {
      rb.path('application', params.application, {});
      rb.path('featuretype', params.featuretype, {});
      rb.path('fid', params.fid, {});
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
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
    application: number;
    featuretype: string;
    fid: string;
    body: Feature
  }): Observable<Feature> {

    return this.update$Response(params).pipe(
      map((r: StrictHttpResponse<Feature>) => r.body as Feature)
    );
  }

  /**
   * Path part for operation update
   */
  static readonly UpdateBulkPath = '/features/updatebulk/{application}/{featureType}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateBulk$Response(params: {
    application: number;
    featureType: string;
    body: { filter: string; updatedFields: Record<string, string | number | null> };
  }): Observable<StrictHttpResponse<boolean>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.UpdateBulkPath, 'put');
    if (params) {
      rb.path('application', params.application, {});
      rb.path('featureType', params.featureType, {});
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<boolean>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `update$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateBulk(params: {
    application: number;
    featureType: string;
    body: { filter: string; updatedFields: Record<string, string | number | null> };
  }): Observable<boolean> {
    return this.updateBulk$Response(params).pipe(
      map((r: StrictHttpResponse<boolean>) => r.status === 200)
    );
  }

  /**
   * Path part for operation delete
   */
  static readonly DeletePath = '/features/{application}/{featuretype}/{fid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete$Response(params: {
    application: number;
    featuretype: string;
    fid: string;
  }): Observable<StrictHttpResponse<boolean>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.DeletePath, 'delete');
    if (params) {
      rb.path('application', params.application, {});
      rb.path('featuretype', params.featuretype, {});
      rb.path('fid', params.fid, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return (r as HttpResponse<any>).clone({ body: String((r as HttpResponse<any>).body) === 'true' }) as StrictHttpResponse<boolean>;
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
    application: number;
    featuretype: string;
    fid: string;
  }): Observable<boolean> {

    return this.delete$Response(params).pipe(
      map((r: StrictHttpResponse<boolean>) => r.body as boolean)
    );
  }

  /**
   * Path part for operation save
   */
  static readonly SavePath = '/features/{application}/{featuretype}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `save()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  save$Response(params: {
    parentId?: string;
    application: number;
    featuretype: string;
    body: Feature
  }): Observable<StrictHttpResponse<Feature>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.SavePath, 'post');
    if (params) {
      rb.query('parentId', params.parentId, {});
      rb.path('application', params.application, {});
      rb.path('featuretype', params.featuretype, {});
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
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
    application: number;
    featuretype: string;
    body: Feature
  }): Observable<Feature> {

    return this.save$Response(params).pipe(
      map((r: StrictHttpResponse<Feature>) => r.body as Feature)
    );
  }

  /**
   * Path part for operation onPoint
   */
  static readonly OnPointPath = '/features/{application}/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint$Response(params: {
    application: number;
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<Feature>>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.OnPointPath, 'get');
    if (params) {
      rb.path('application', params.application, {});
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
    'x': number;
    'y': number;
    scale: number;
  }): Observable<Array<Feature>> {

    return this.onPoint$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Feature>>) => r.body as Array<Feature>)
    );
  }

  /**
   * Path part for operation featuretypeOnPoint
   */
  static readonly FeaturetypeOnPointPath = '/features/{application}/{featureTypes}/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `featuretypeOnPoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  featuretypeOnPoint$Response(params: {
    application: number;
    featureTypes: Array<string>;
    'x': number;
    'y': number;
    scale: number;
  }): Observable<StrictHttpResponse<Array<Feature>>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.FeaturetypeOnPointPath, 'get');
    if (params) {
      rb.path('application', params.application, {});
      rb.path('featureTypes', params.featureTypes, {});
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
    application: number;
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
  static readonly GetFeaturesForIdsPath = '/features/by-id/{application}/{featureType}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFeaturesForIds$Response(params: {
    application: number;
    featureType: string;
    featureIds: Array<string>;
  }): Observable<StrictHttpResponse<Array<Feature>>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.GetFeaturesForIdsPath, 'post');
    if (params) {
      rb.path('application', params.application, {});
      rb.path('featureType', params.featureType, {});
      rb.body(params.featureIds || []);
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
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
  getFeaturesForIds(params: {
    application: number;
    featureType: string;
    featureIds: Array<string>;
  }): Observable<Array<Feature>> {
    return this.getFeaturesForIds$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Feature>>) => r.body as Array<Feature>)
    );
  }

  /**
   * Path part for operation featuretypeInformation
   */
  static readonly FeaturetypeInformationPath = '/features/info/{appId}/{featureTypes}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `featuretypeInformation()` instead.
   *
   * This method doesn't expect any request body.
   */
  featuretypeInformation$Response(params: {
    appId: number;
    featureTypes: Array<string>;
  }): Observable<StrictHttpResponse<Array<FeaturetypeMetadata>>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.FeaturetypeInformationPath, 'get');
    if (params) {
      rb.path('appId', params.appId, {});
      rb.path('featureTypes', params.featureTypes, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<FeaturetypeMetadata>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `featuretypeInformation$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  featuretypeInformation(params: {
    appId: number;
    featureTypes: Array<string>;
  }): Observable<Array<FeaturetypeMetadata>> {

    return this.featuretypeInformation$Response(params).pipe(
      map((r: StrictHttpResponse<Array<FeaturetypeMetadata>>) => r.body as Array<FeaturetypeMetadata>)
    );
  }

}
