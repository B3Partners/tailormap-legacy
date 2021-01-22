import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { selectApplicationId, selectLevelForLayer } from '../../application/state/application.selectors';
import { concatMap, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { clearCreateLayerMode, setCreatingLayer, setCreatingLayerFailed, setCreatingLayerSuccess } from '../state/analysis.actions';
import { CriteriaHelper } from '../criteria/helpers/criteria.helper';
import { addAppLayer } from '../../application/state/application.actions';
import { selectCreateLayerData, selectSelectedDataSource } from '../state/analysis.selectors';
import { StyleHelper } from '../helpers/style.helper';
import { UserLayerApiService, UserLayerResponseType } from './user-layer-api.service';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { AppLayer } from '../../../../../bridge/typings';

interface CreateUserLayerParams {
  appLayerId: string;
  title: string;
  query: string;
  style?: string;
  createdAppLayer?: string;
  source?: AnalysisSourceModel;
}
@Injectable({
  providedIn: 'root',
})
export class UserLayerService {

  constructor(
    private userLayerApiService: UserLayerApiService,
    private store$: Store<AnalysisState>,
  ) {}

  public createUserLayerFromParams(params: CreateUserLayerParams) {
    this.saveUserLayer$(params.appLayerId, params.title, params.query, params.style, params.createdAppLayer)
      .subscribe(([createLayerResult, saveStyleResult]) => {
        this.handleResult(createLayerResult, saveStyleResult, params.source);
      });
  }

  public createUserLayer() {
    this.store$.select(selectCreateLayerData)
      .pipe(
        take(1),
        filter(data => data.canCreateLayer),
        tap(() => this.store$.dispatch(setCreatingLayer())),
        switchMap(data => {
          const query = data.createLayerMode === CreateLayerModeEnum.THEMATIC
            ? CriteriaHelper.convertStyleToQuery(data.styles)
            : CriteriaHelper.convertCriteriaToQuery(data.criteria);
          return this.saveUserLayer$(
            `${data.selectedDataSource.layerId}`,
            data.layerName,
            query,
            StyleHelper.convertStyles(data.styles, data.selectedDataSource),
            data.createdAppLayer,
          );
        }),
      ).subscribe(([createLayerResult, saveStyleResult]) => {
      this.handleResult(createLayerResult, saveStyleResult);
    })
  }

  public removeLayer$(layer: AppLayer): Observable<{ success: boolean, message?: string }> {
    if (!layer.userlayer) {
      return of({ success: true });
    }
    return this.store$.select(selectApplicationId)
      .pipe(
        take(1),
        switchMap(appId => this.userLayerApiService.removeUserLayer({appId, appLayerId: layer.id })),
        map(response => {
          if (response !== null && UserLayerApiService.isFailedResponse(response)) {
            const message = [response.error || '', response.message || ''].filter(m => m !== '').join(' - ');
            return { success: false, message };
          }
          return { success: true };
        }),
      );
  }

  private saveUserLayer$(appLayerId: string, title: string, query: string, style?: string, createdAppLayer?: string) {

    return this.store$.select(selectApplicationId)
      .pipe(
        take(1),
        switchMap(appId => {
          return forkJoin([
            !!createdAppLayer ? of(null) : this.userLayerApiService.createUserLayer({appId, appLayerId, title, query }),
            of(appId),
          ]);
        }),
        concatMap(([response, appId]) => {
          if (response !== null && UserLayerApiService.isFailedResponse(response)) {
            return forkJoin([of(response), of(null)]);
          }
          if ((response === null || !UserLayerApiService.isSuccessResponse(response)) && !createdAppLayer) {
            throw new Error('Tried to save style for a non-created layer');
          }
          const appLayer = response !== null && UserLayerApiService.isSuccessResponse(response)
            ? response.message.appLayer.id
            : createdAppLayer;
          return forkJoin([
            of(response),
            !style ? of(null) : this.userLayerApiService.saveUserLayerStyle({ appId, userAppLayerId: appLayer, style }),
          ]);
        }),
      )
  }
  private handleResult(
    createLayerResult: UserLayerResponseType,
    saveStyleResult: UserLayerResponseType | null,
    source?: AnalysisSourceModel,
  ) {
    if (createLayerResult !== null && UserLayerApiService.isFailedResponse(createLayerResult)) {
      const message = [createLayerResult.error || '', createLayerResult.message || ''].filter(m => m !== '').join(' - ');
      this.store$.dispatch(setCreatingLayerFailed({message}));
    }
    if (saveStyleResult !== null && UserLayerApiService.isFailedResponse(saveStyleResult)) {
      const message = [saveStyleResult.error || '', saveStyleResult.message || ''].filter(m => m !== '').join(' - ');
      this.store$.dispatch(setCreatingLayerFailed({message}));
    }
    if (createLayerResult !== null && UserLayerApiService.isSuccessResponse(createLayerResult)) {
      const source$ = !!source ? of(source) : this.store$.select(selectSelectedDataSource);
      source$
        .pipe(
          take(1),
          switchMap(selectedDataSource => {
            return this.store$.select(selectLevelForLayer, `${selectedDataSource.layerId}`).pipe(take(1));
          }),
        )
        .subscribe(level => {
          this.store$.dispatch(addAppLayer({
            layer: {
              ...createLayerResult.message.appLayer,
              background: false,
              visible: false,
            },
            service: createLayerResult.message.service,
            levelId: level ? level.id : '',
          }));
        });
      this.store$.dispatch(setCreatingLayerSuccess({ createdAppLayer: createLayerResult.message.appLayer.id }));
    }
    if (
      (createLayerResult === null || UserLayerApiService.isSuccessResponse(createLayerResult))
      && (saveStyleResult === null || UserLayerApiService.isSuccessResponse(saveStyleResult))
    ) {
      this.store$.dispatch(clearCreateLayerMode());
    }
  }

}
