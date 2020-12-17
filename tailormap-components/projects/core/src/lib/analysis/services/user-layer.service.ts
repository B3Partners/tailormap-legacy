import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import {
  selectApplicationId,
  selectLevelForLayer,
} from '../../application/state/application.selectors';
import {
  catchError,
  filter,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {
  combineLatest,
  Observable,
  of,
} from 'rxjs';
import {
  CreateUserLayerFailedResponseModel,
  CreateUserLayerSuccessResponseModel,
} from '../models/create-user-layer-response.model';
import {
  setCreatingLayer,
  setCreatingLayerFailed,
  setCreatingLayerSuccess,
} from '../state/analysis.actions';
import { CriteriaHelper } from '../criteria/helpers/criteria.helper';
import { addAppLayer } from '../../application/state/application.actions';
import {
  selectCanCreateLayer,
  selectCreateLayerData,
  selectSelectedDataSource,
} from '../state/analysis.selectors';

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

  public createUserLayer() {
    this.store$.select(selectCreateLayerData)
      .pipe(
        take(1),
        filter(data => data.canCreateLayer),
        tap(() => this.store$.dispatch(setCreatingLayer())),
        switchMap(data => {
          const query = CriteriaHelper.convertCriteriaToQuery(data.criteria);
          return this.saveUserLayer$(
            data.layerName,
            `${data.selectedDataSource.layerId}`,
            query,
          );
        }),
        catchError((): Observable<CreateUserLayerFailedResponseModel> => {
          return of({
            success: false,
            message: 'Er is iets mis gegaan bij het maken van een laag. Controlleer de instellingen en probeer opnieuw.',
          });
        }),
      ).subscribe(result => {
        this.handleResult(result);
      })
  }

  private saveUserLayer$(name: string, layerId: string, criteria: string) {
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

  private handleResult(result: ResponseType) {
    if (UserLayerService.isFailedResponse(result)) {
      const message = [ result.error || '', result.message || '' ].filter(m => m !== '').join(' - ');
      this.store$.dispatch(setCreatingLayerFailed({ message }));
    }
    if (UserLayerService.isSuccessResponse(result)) {
      this.store$.select(selectSelectedDataSource)
        .pipe(
          take(1),
          switchMap(selectedDataSource => this.store$.select(selectLevelForLayer, `${selectedDataSource.layerId}`)),
        )
        .subscribe(level => {
          this.store$.dispatch(addAppLayer({
            layer: {
              ...result.message.appLayer,
              background: false,
            },
            service: result.message.service,
            levelId: level ? level.id : '',
          }));
          this.store$.dispatch(setCreatingLayerSuccess());
      });
    }
  }

}
