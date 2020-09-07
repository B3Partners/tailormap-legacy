import { Injectable } from '@angular/core';
import { FormHelpers } from '../form/form-helpers';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Feature,
  FeatureControllerService,
} from '../../shared/generated';
import {
  Observable,
  of,
} from 'rxjs';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';


@Injectable({
  providedIn: 'root',
})
export class FormActionsService {

  constructor(
    private confirmDialogService: ConfirmDialogService,
    private service: FeatureControllerService,
    private formConfigRepo: FormconfigRepositoryService,
    private featureInitializerService: FeatureInitializerService,
    private _snackBar: MatSnackBar) {
  }

  public save(isBulk: boolean, feature: Feature, parent: Feature): Observable<any> {

    if (isBulk) {
      console.error('to be implemented');

    } else {
      const objectGuid = feature.objectGuid;
      if (objectGuid && objectGuid !== FeatureInitializerService.STUB_objectGuid_NEW_OBJECT) {
        return this.service.update({objectGuid, body: feature});
      } else {
        const parentId = parent ? parent.objectGuid : null;
        return this.service.save({parentId, body: feature});
      }
    }
  }

  public removeFeature(feature: Feature, features: Feature[]): Observable<any> {
    this.service.delete({featuretype: feature.clazz, objectGuid: feature.objectGuid}).subscribe(a => {
      console.log('removed: ', a);
    });

    const fs = this.removeFeatureFromArray(features, feature);

    console.error('to be implemented');
    return of({piet: 1, features: fs});
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

  public newItem(evt, features): Observable<any> {
    const type = evt.srcElement.id;
    const formConfig = this.formConfigRepo.getFormConfig(type);
    const name = 'Nieuwe ' + formConfig.name;

    const parentFeature = features[0];
    // const relations = formConfig.relation.relation;
    const objecttype = FormHelpers.capitalize(type);

    const newFeature = this.featureInitializerService.create(objecttype, {
      id: null,
      clazz: type,
      isRelated: true,
      objecttype,
      children: null,
    });

    newFeature[formConfig.treeNodeColumn] = name;
    /* relations.forEach(r => {
       const relatedKey = r.relatedFeatureColumn;
       const mainKey = r.mainFeatureColumn;
       newFeature[relatedKey] = parentFeature[mainKey];
     });*/
    parentFeature.children.push(newFeature);
    const feature = newFeature;
    features = [...features];
    console.error('initform!@');
    return of({features, feature});
  }

}
