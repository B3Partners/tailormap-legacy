/* tslint:disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { Boom } from '../models/boom';
import { Boominspectie } from '../models/boominspectie';
import { Boomplanning } from '../models/boomplanning';
import { CultBeplanting } from '../models/cult-beplanting';
import { Gras } from '../models/gras';
import { Haag } from '../models/haag';
import { NatBeplanting } from '../models/nat-beplanting';
import { Rioolput } from '../models/rioolput';
import { Weginspectie } from '../models/weginspectie';
import { Wegvakonderdeel } from '../models/wegvakonderdeel';
import { Wegvakonderdeelplanning } from '../models/wegvakonderdeelplanning';

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
   * Path part for operation get
   */
  static readonly GetPath = '/features/{featuretype}/{objectGuid}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get()` instead.
   *
   * This method doesn't expect any request body.
   */
  get$Response(params: {
    featuretype: string;
    objectGuid: string;

  }): Observable<StrictHttpResponse<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.GetPath, 'get');
    if (params) {

      rb.path('featuretype', params.featuretype, {});
      rb.path('objectGuid', params.objectGuid, {});

    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get(params: {
    featuretype: string;
    objectGuid: string;

  }): Observable<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning> {

    return this.get$Response(params).pipe(
      map((r: StrictHttpResponse<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>) => r.body as Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning)
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
      body: Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning
  }): Observable<StrictHttpResponse<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.UpdatePath, 'put');
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
        return r as StrictHttpResponse<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>;
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
      body: Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning
  }): Observable<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning> {

    return this.update$Response(params).pipe(
      map((r: StrictHttpResponse<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>) => r.body as Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning)
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
      body: Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning
  }): Observable<StrictHttpResponse<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.SavePath, 'post');
    if (params) {

      rb.query('parentId', params.parentId, {});

      rb.body(params.body, 'application/json');
    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>;
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
      body: Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning
  }): Observable<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning> {

    return this.save$Response(params).pipe(
      map((r: StrictHttpResponse<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>) => r.body as Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning)
    );
  }

  /**
   * Path part for operation getAll
   */
  static readonly GetAllPath = '/features/unpaged';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAll()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll$Response(params?: {

  }): Observable<StrictHttpResponse<Array<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.GetAllPath, 'get');
    if (params) {


    }
    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `getAll$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAll(params?: {

  }): Observable<Array<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>> {

    return this.getAll$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>>) => r.body as Array<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>)
    );
  }

  /**
   * Path part for operation onPoint
   */
  static readonly OnPointPath = '/features/{x}/{y}/{scale}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `onPoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  onPoint$Response(params: {
    'x': number;
    'y': number;
    scale: number;

  }): Observable<StrictHttpResponse<Array<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>>> {

    const rb = new RequestBuilder(this.rootUrl, FeatureControllerService.OnPointPath, 'get');
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
        return r as StrictHttpResponse<Array<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>>;
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
    'x': number;
    'y': number;
    scale: number;

  }): Observable<Array<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>> {

    return this.onPoint$Response(params).pipe(
      map((r: StrictHttpResponse<Array<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>>) => r.body as Array<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | NatBeplanting | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>)
    );
  }

}
