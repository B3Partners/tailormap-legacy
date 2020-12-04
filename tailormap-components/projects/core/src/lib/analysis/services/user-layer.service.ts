import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { selectApplicationId } from '../../application/state/application.selectors';
import {
  switchMap,
  take,
} from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  CreateUserLayerFailedResponseModel,
  CreateUserLayerSuccessResponseModel,
} from './create-user-layer-response.model';

type ResponseType = CreateUserLayerSuccessResponseModel | CreateUserLayerFailedResponseModel;

@Injectable({
  providedIn: 'root',
})
export class UserLayerService {

  constructor(
    private httpClient: HttpClient,
    private tailormapService: TailorMapService,
    private store$: Store<AnalysisState>,
  ) {}

  public static isSuccessResponse(response: ResponseType): response is CreateUserLayerSuccessResponseModel {
    return response.success;
  }

  public static isFailedResponse(response: ResponseType): response is CreateUserLayerFailedResponseModel {
    return !response.success;
  }

  public createUserLayer$(name: string, layerId: string, criteria: string): Observable<ResponseType> {
    return this.store$.select(selectApplicationId)
      .pipe(
        take(1),
        switchMap(appId => {
          const params = new HttpParams()
            .set('application', `${appId}`)
            .set('appLayer', layerId)
            .set('title', name)
            .set('query', criteria);
          return this.httpClient.post<ResponseType>(this.tailormapService.getContextPath() + '/action/userlayer/add',
            params.toString(),
            {
              headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'),
              observe: 'body',
              withCredentials: true,
            });
        }),
      )
  }

}
