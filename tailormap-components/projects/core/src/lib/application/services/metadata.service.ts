import {
  Injectable,
  OnDestroy,
} from '@angular/core';
import { AttributeService } from '../../shared/attribute-service/attribute.service';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../state/application.state';
import { selectApplicationId } from '../state/application.selectors';
import {
  map,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs/operators';
import {
  Observable,
  of,
  Subject,
} from 'rxjs';
import { AttributeMetadataResponse } from '../../shared/attribute-service/attribute-models';

@Injectable({
  providedIn: 'root',
})
export class MetadataService implements OnDestroy {

  private destroy = new Subject();
  private applicationId: number;

  private attributeCache: Map<string, AttributeMetadataResponse> = new Map();

  constructor(
    private store$: Store<ApplicationState>,
    private attributeService: AttributeService,
  ) {
    this.store$.select(selectApplicationId)
      .pipe(takeUntil(this.destroy))
      .subscribe(appId => {
        this.attributeCache = new Map();
      });
  }

  public getFeatureTypeMetadata$(layerId: string | number): Observable<AttributeMetadataResponse> {
    if (this.attributeCache.has(`${layerId}`)) {
      return of(this.attributeCache.get(`${layerId}`));
    }
    return this.store$.select(selectApplicationId)
      .pipe(
        takeWhile(appId => appId === null, true),
        switchMap(application => {
          return this.attributeService.featureTypeMetadata$({
            application,
            appLayer: +(layerId),
          }).pipe(tap(result => {
            if (result.success) {
              this.attributeCache.set(`${layerId}`, result);
            }
          }))
        }),
      )
  }

  public ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

}
