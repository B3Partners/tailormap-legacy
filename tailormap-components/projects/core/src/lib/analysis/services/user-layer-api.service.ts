import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { catchError } from 'rxjs/operators';
import {
  Observable,
  of,
} from 'rxjs';
import {
  CreateUserLayerFailedResponseModel,
  CreateUserLayerSuccessResponseModel,
} from '../models/create-user-layer-response.model';

export interface CreateUserLayerParams {
  appId: number;
  appLayerId: string;
  title: string;
  query: string;
}

export interface SaveUserLayerStyleParams {
  appId: number;
  userAppLayerId: string;
  style: string;
}

export type UserLayerResponseType = CreateUserLayerSuccessResponseModel | CreateUserLayerFailedResponseModel;

@Injectable({
  providedIn: 'root',
})
export class UserLayerApiService {

  constructor(
    private httpClient: HttpClient,
    private tailormapService: TailorMapService,
  ) {}

  public static isSuccessResponse(response: UserLayerResponseType): response is CreateUserLayerSuccessResponseModel {
    return response.success;
  }

  public static isFailedResponse(response: UserLayerResponseType): response is CreateUserLayerFailedResponseModel {
    return !response.success;
  }

  public createUserLayer(params: CreateUserLayerParams) {
    const httpParams = new HttpParams().set('title', params.title).set('query', params.query);
    return this.httpClient.post<UserLayerResponseType>(`${this.tailormapService.getContextPath()}/action/userlayer/add/${params.appId}/${params.appLayerId}`,
      httpParams.toString(),
      {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'),
        observe: 'body',
        withCredentials: true,
      }).pipe(
        catchError((response: HttpErrorResponse): Observable<CreateUserLayerFailedResponseModel> => {
          if (response.error && UserLayerApiService.isFailedResponse(response.error) && response.error.error) {
            return of({
              success: false,
              message: 'Er is iets mis gegaan bij het maken van een laag: ' + response.error.error,
            });
          }
          return of({
            success: false,
            message: 'Er is iets mis gegaan bij het maken van een laag. Controlleer de instellingen en probeer opnieuw.',
          });
        }),
      );
  }

  public saveUserLayerStyle(params: SaveUserLayerStyleParams) {
    const httpParams = new HttpParams().set('style', params.style);
    return this.httpClient.post<UserLayerResponseType>(`${this.tailormapService.getContextPath()}/action/userlayer/put/${params.appId}/${params.userAppLayerId}`,
      httpParams.toString(),
      {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'),
        observe: 'body',
        withCredentials: true,
      }).pipe(
      catchError((response: HttpErrorResponse): Observable<CreateUserLayerFailedResponseModel> => {
        if (response.error && UserLayerApiService.isFailedResponse(response.error) && response.error.error) {
          return of({
            success: false,
            message: 'Er is iets mis gegaan bij opslaan van de stijl: ' + response.error.error,
          });
        }
        return of({
          success: false,
          message: 'Er is iets mis gegaan bij opslaan van de stijl. Controlleer de instellingen en probeer opnieuw.',
        });
      }),
    );
  }

}
