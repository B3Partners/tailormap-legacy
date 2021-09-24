import { Injectable } from '@angular/core';
import { AttributeListService } from '@tailormap/core-components';
import { Store } from '@ngrx/store';
import { FeatureControllerService } from '../../shared/generated';
import { concatMap, filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApplicationService } from '../../application/services/application.service';
import { setOpenFeatureForm } from '../state/form.actions';

@Injectable({
  providedIn: 'root',
})
export class FormAttributeListService {

  private destroyed = new Subject();

  constructor(
    private attributeListService: AttributeListService,
    private store$: Store,
    private featureControllerService: FeatureControllerService,
    private applicationService: ApplicationService,
  ) {
    attributeListService.getSelectedRow$()
      .pipe(
        takeUntil(this.destroyed),
        filter(selectedRow => selectedRow !== null),
        concatMap(selectedRow => this.featureControllerService.getFeaturesForIds({
          application: this.applicationService.getApplicationId(),
          featureType: selectedRow.featureTypeName,
          featureIds: [ selectedRow.fid ],
        })),
        filter(features => !!features && features.length > 0),
      )
      .subscribe(features => {
        this.store$.dispatch(setOpenFeatureForm({ features }));
      });
  }

}
