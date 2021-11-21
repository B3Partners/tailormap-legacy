import { Injectable } from '@angular/core';
import { Feature, FeatureControllerService } from '../../shared/generated';
import { forkJoin, Observable } from 'rxjs';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';


@Injectable({
  providedIn: 'root',
})
export class FormActionsService {

  constructor(
    private service: FeatureControllerService,
    private tailormap: TailorMapService,
  ) {
  }

  public saveBulk$(features: Feature[]): Observable<Feature[]> {
    const reqs: Observable<Feature>[] = [];
    features.forEach(feature => {
      reqs.push(this.service.update({application: this.tailormap.getApplicationId(),
        featuretype: feature.tableName, fid: feature.fid, body: feature}));
    });
    return forkJoin(reqs);
  }

  public save$(feature: Feature, parentId?: string | null): Observable<Feature> {
    const appId = this.tailormap.getApplicationId();
    if (feature.fid && feature.fid !== FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT) {
      return this.service.update({
        application: appId,
        featuretype: feature.tableName,
        fid: feature.fid,
        body: feature,
      });
    } else {
      return this.service.save({
        application: appId,
        featuretype: feature.tableName,
        parentId: parentId || '-1',
        body: feature,
      });
    }
  }

  public removeFeature$(feature: Feature): Observable<boolean> {
    return this.service.delete({application: this.tailormap.getApplicationId(),
      featuretype: feature.tableName, fid: feature.fid});
  }
}
