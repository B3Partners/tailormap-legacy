import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { AttributeMetadataResponse } from '../../shared/attribute-service/attribute-models';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { selectApplicationId } from '../../application/state/application.selectors';
import {
  switchMap,
  take,
} from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserLayerService {

  constructor(
    private httpClient: HttpClient,
    private tailormapService: TailorMapService,
    private store$: Store<AnalysisState>,
  ) {}

  public createUserLayer$(name: string, layerId: string, criteria: string): Observable<HttpResponse<{}>> {
    return this.store$.select(selectApplicationId)
      .pipe(
        take(1),
        switchMap(appId => {
          let params = new HttpParams();
          params = params.set('application', `${appId}`);
          params = params.set('appLayer', layerId);
          params = params.set('title', name);
          params = params.set('query', criteria);
          return this.httpClient.get(this.tailormapService.getContextPath() + '/action/userlayer/add', {
            params,
            observe: 'response',
          });
        }),
      )
  }

}
