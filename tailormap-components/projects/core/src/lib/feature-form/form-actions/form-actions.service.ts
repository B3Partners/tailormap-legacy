import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Feature, FeatureControllerService } from '../../shared/generated';
import { forkJoin, Observable, of } from 'rxjs';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';


@Injectable({
  providedIn: 'root',
})
export class FormActionsService {

  constructor(
    private service: FeatureControllerService,
    private _snackBar: MatSnackBar) {
  }

  public save$(isBulk: boolean, features: Feature[], parent: Feature): Observable<any> {

    if (isBulk) {
      const reqs : Observable<any>[] = [];
      features.forEach(feature => {
        const objectGuid = feature.objectGuid;
        reqs.push(this.service.update({objectGuid, body: feature}));
      });
      return forkJoin(reqs);
    } else {
      const feature = features[0];
      const objectGuid = feature.objectGuid;
      if (objectGuid && objectGuid !== FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT) {
        return this.service.update({objectGuid, body: feature});
      } else {
        const parentId = parent ? parent.objectGuid : null;
        return this.service.save({parentId, body: feature});
      }
    }
  }

  public removeFeature$(feature: Feature): Observable<any> {
    return this.service.delete({featuretype: feature.clazz, objectGuid: feature.objectGuid});
  }

  private removeFeatureFromArray(features: Feature[], feature: Feature): Feature[] {
    let fs = [];
    if (features) {
      fs = [...features.filter(f => f !== feature)];
      fs.forEach(f => {
        f.children = this.removeFeatureFromArray(f.children, feature);
      });
    }
    return fs;
  }

}
