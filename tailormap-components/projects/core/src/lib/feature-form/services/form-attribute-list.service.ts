import { Inject, Injectable } from '@angular/core';
import { AttributeListService } from '@tailormap/core-components';
import { Store } from '@ngrx/store';
import { FeatureControllerService } from '../../shared/generated';
import { catchError, concatMap, filter, map, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { setOpenFeatureForm } from '../state/form.actions';
import { APPLICATION_SERVICE, ApplicationServiceModel } from '@tailormap/api';

@Injectable({
  providedIn: 'root',
})
export class FormAttributeListService {

  private destroyed = new Subject();

  constructor(
    private attributeListService: AttributeListService,
    private store$: Store,
    private featureControllerService: FeatureControllerService,
    @Inject(APPLICATION_SERVICE) private applicationService: ApplicationServiceModel,
  ) {
    attributeListService.getSelectedRow$()
      .pipe(
        takeUntil(this.destroyed),
        filter(selectedRow => selectedRow !== null),
        concatMap(selectedRow => this.featureControllerService.getFeaturesForIds({
          application: this.applicationService.getApplicationId(),
          featureType: selectedRow.featureTypeName,
          featureIds: [ selectedRow.fid ],
        }).pipe(
          catchError(() => of([])),
        )),
        filter(features => !!features && features.length > 0),
        map(features => features.length > 1 ? [ features[0] ] : features),
      )
      .subscribe(features => {
        this.store$.dispatch(setOpenFeatureForm({ features }));
      });
  }

}
