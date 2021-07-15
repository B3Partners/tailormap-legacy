import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserLayerStyleModel } from '../models/user-layer-style.model';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { selectCreateLayerData } from '../state/analysis.selectors';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { MetadataService, UniqueValueCountResponse } from '../../application/services/metadata.service';
import { ExtendedAttributeModel } from '../../application/models/extended-attribute.model';
import { CriteriaModel } from '../models/criteria.model';
import { StyleHelper } from '../helpers/style.helper';
import { IdService } from '../../shared/id-service/id.service';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { CriteriaHelper } from '../criteria/helpers/criteria.helper';
import { ScopedUserLayerStyleModel } from '../models/scoped-user-layer-style.model';
import { AttributeTypeHelper } from '../../application/helpers/attribute-type.helper';
import { METADATA_SERVICE } from '@tailormap/models';

export type CreateStyleResult = { styles: UserLayerStyleModel[]; errorMessage?: string };
type CachedStylesResult = [ string, CreateStyleResult ];

@Injectable({
  providedIn: 'root',
})
export class CreateStyleService {

  private static INCOMPLETE_DATA_RESULT: CreateStyleResult = { styles: [], errorMessage: 'Kan de stijl niet maken, er ontbreken gegevens, ga terug en controleer de instellingen' };

  private cachedAttributeStyle: CachedStylesResult;
  private cachedThematicStyle: CachedStylesResult;

  private defaultStyleColors = [
    'rgb(165, 39, 20)',
    'rgb(230, 81, 0)',
    'rgb(249, 168, 37)',
    'rgb(85, 139, 47)',
    'rgb(1, 87, 155)',
    'rgb(103, 58, 183)',
    'rgb(255, 82, 82)',
    'rgb(251, 192, 45)',
    'rgb(2, 136, 209)',
    'rgb(234, 153, 153)',
    'rgb(159, 168, 218)',
  ];

  constructor(
    private store$: Store<AnalysisState>,
    @Inject(METADATA_SERVICE) private metadataService: MetadataService,
    private idService: IdService,
  ) {}

  public createStyles$(): Observable<CreateStyleResult> {
    return this.store$.select(selectCreateLayerData)
      .pipe(
        take(1),
        switchMap(createLayerData => {
          if (!createLayerData.canCreateLayer) {
            return of(CreateStyleService.INCOMPLETE_DATA_RESULT);
          }
          if (createLayerData.createLayerMode === CreateLayerModeEnum.ATTRIBUTES) {
            return this.createAttributesStyles$(
              createLayerData.selectedDataSource,
              createLayerData.criteria,
            );
          }
          if (createLayerData.createLayerMode === CreateLayerModeEnum.THEMATIC) {
            return this.createThematicStyles$(
              createLayerData.selectedDataSource.layerId,
              createLayerData.selectedDataSource.featureType,
              createLayerData.thematicAttribute,
            );
          }
          // Should not happen
          return of({ styles: [], errorMessage: 'Kan voor deze modus geen stijl maken' });
        }),
      );
  }

  private createAttributesStyles$(
    selectedDataSource?: AnalysisSourceModel,
    criteria?: CriteriaModel,
  ): Observable<CreateStyleResult> {
    if (!criteria || !selectedDataSource) {
      return of(CreateStyleService.INCOMPLETE_DATA_RESULT);
    }
    const query = CriteriaHelper.convertCriteriaToQuery(criteria);
    const cachingKey = `${selectedDataSource.layerId}_${query}`;
    if (this.cachedAttributeStyle && this.cachedAttributeStyle[0] === cachingKey) {
      return of(this.cachedAttributeStyle[1]);
    }
    const style: UserLayerStyleModel = {
      ...StyleHelper.getDefaultStyle(this.idService, this.getNextColor(0)),
      label: selectedDataSource.label,
    };
    return this.metadataService.getTotalFeaturesForQuery$(selectedDataSource.layerId, query)
      .pipe(
        map(total => ({ styles: [ { ...style, featureCount: total } ] })),
        // could not get count but we can still create a style here
        catchError(() => of(({ styles: [ style ] }))),
        tap(result => this.cachedAttributeStyle = [ cachingKey, result ]),
      );
  }

  private createThematicStyles$(appLayer?: number, featureType?: number, attribute?: ExtendedAttributeModel): Observable<CreateStyleResult> {
    if (!appLayer || !attribute || !featureType) {
      return of(CreateStyleService.INCOMPLETE_DATA_RESULT);
    }
    const cachingKey = `${appLayer}_${featureType}_${attribute.name}`;
    if (this.cachedThematicStyle && this.cachedThematicStyle[0] === cachingKey) {
      return of(this.cachedThematicStyle[1]);
    }
    return this.metadataService.getUniqueValuesAndTotalForAttribute$(appLayer, featureType, attribute)
      .pipe(
        map((featureInfoRequests: UniqueValueCountResponse[]) => {
          const styles = featureInfoRequests
            .sort((r1, r2) => {
              const r1Count = r1.total || 0;
              const r2Count = r2.total || 0;
              return r1Count === r2Count ? 0 : (r1Count > r2Count) ? -1 : 1;
            })
            .map<ScopedUserLayerStyleModel>((response, idx) => ({
              ...StyleHelper.getDefaultStyle(this.idService, this.getNextColor(idx)),
              label: response.uniqueValue,
              value: response.uniqueValue,
              attribute: attribute.name,
              attributeType: AttributeTypeHelper.getAttributeType(attribute),
              featureCount: response.total,
            }));
          const result = { styles };
          this.cachedThematicStyle = [ cachingKey, result ];
          return result;
        }),
        catchError(() => {
          return of({ styles: [], errorMessage: `Het is niet gelukt om de stijlen op te halen voor dit atttribuut (${attribute.name})` });
        }),
      );
  }

  private getNextColor(idx: number) {
    return this.defaultStyleColors[idx % this.defaultStyleColors.length];
  }

}
