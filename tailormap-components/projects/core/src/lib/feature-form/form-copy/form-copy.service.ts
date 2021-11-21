import { Injectable } from '@angular/core';
import { Feature } from '../../shared/generated';
import { FormActionsService } from '../form-actions/form-actions.service';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { forkJoin, Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

interface CopyResultResponse {
  success: boolean;
  message?: string;
  feature?: Feature;
}

type CopyResultType = Observable<CopyResultResponse>;

@Injectable({
  providedIn: 'root',
})
export class FormCopyService {

  // Map for featureTypes where each featureType has a Set with checked attribute keys
  public featuresToCopy = new Map<string, Set<string>>();

  constructor(
    private formActionsService: FormActionsService,
    private featureInitializer: FeatureInitializerService,
  ) {}

  public enableField(featureType: string, fieldKey: string) {
    if (!this.featuresToCopy.has(featureType)) {
      this.featuresToCopy.set(featureType, new Set());
    }
    this.featuresToCopy.get(featureType).add(fieldKey);
  }

  public disableField(featureType: string, fieldKey: string) {
    if (!this.featuresToCopy.has(featureType)) {
      this.featuresToCopy.set(featureType, new Set());
    }
    this.featuresToCopy.get(featureType).delete(fieldKey);
  }

  public copy(
    baseFeature: Feature,
    destinationFeatures: Feature[],
    deleteRelated: boolean,
    relatedFeatures: string[],
  ): CopyResultType[] {
    if (destinationFeatures.length <= 0) {
      return [ of({ success: false, message: 'Er zijn geen objecten geselecteerd!' }) ];
    }
    const requests$: Observable<{ success: boolean; message?: string }>[] = [];
    if (deleteRelated) {
      destinationFeatures.forEach(destinationFeature => {
        requests$.push(...this.getDeleteFeatureRequest$(destinationFeature));
      });
    }
    const valuesToCopy = this.getPropertiesToMerge(baseFeature);
    for (let i  = 0; i <= destinationFeatures.length - 1; i++) {
      const copyDestinationFeature: Feature = {
        ...destinationFeatures[i],
        attributes: destinationFeatures[i].attributes.map(field => ({
          key: field.key,
          value: valuesToCopy.has(field.key) ? valuesToCopy.get(field.key) : field.value,
          type: field.type,
        })),
      };
      requests$.push(...this.getNewChildFeatureRequests$(baseFeature.children, relatedFeatures, copyDestinationFeature));
      requests$.push(this.saveFeature$(copyDestinationFeature));
    }
    return requests$;
  }

  private getDeleteFeatureRequest$(destinationFeature: Feature): Observable<CopyResultResponse>[] {
    const deleteRequests$: Observable<CopyResultResponse>[] = [];
    destinationFeature.children.forEach(child => {
      if (child.children) {
        const subDeleteRequests$: Observable<CopyResultResponse>[] = [];
        child.children.forEach(subChild => subDeleteRequests$.push(...this.getDeleteFeatureRequest$(subChild)));
        deleteRequests$.push(...subDeleteRequests$);
      }
      deleteRequests$.push(this.formActionsService.removeFeature$(child).pipe(map(result => {
        return {
          success: result,
          message: !result ? `Fout bij verwijderen van gerelateerd object voor ${destinationFeature.layerName}` : undefined,
        };
      })));
    });
    return deleteRequests$;
  }

  private getPropertiesToMerge(feature: Feature): Map<string, string> {
    const valuesToCopy = new Map<string, string>();
    const fieldsToCopy = this.featuresToCopy.get(feature.tableName);
    const attributesMap = new Map<string, any>(feature.attributes.map(attribute => [attribute.key, attribute.value ]));
    fieldsToCopy.forEach((value, key) => {
      valuesToCopy.set(key, attributesMap.get(key));
    });
    return valuesToCopy;
  }

  private getNewChildFeatureRequests$(children: Feature[], relatedFeatures: string[], parentFeature: Feature) {
    const requests$: CopyResultType[] = [];
    children
      // Filter out children that should not be copied
      .filter(child => relatedFeatures.findIndex(r => child.fid === r) !== -1)
      .forEach(child => {
        // Merge the values for the children
        const valuesToCopy = {};
        this.getPropertiesToMerge(child).forEach((value, key) => {
          valuesToCopy[key] = value;
        });
        requests$.push(
          // Create a new feature
          this.featureInitializer.create$(child.tableName, valuesToCopy)
            .pipe(
              // Save new feature
              concatMap(feature => this.saveFeature$(feature, parentFeature)),
              // If applicable, recursively create child features
              concatMap(result => this.getRecursiveNewChildRequests$(result, child, relatedFeatures)),
            ),
        );
      });
    return requests$;
  }

  private getRecursiveNewChildRequests$(parentRequestResult: CopyResultResponse, parent: Feature, relatedFeatures: string[]): CopyResultType {
    const subChildren = parent.children || [];
    if (!parentRequestResult.feature || subChildren.length === 0) {
      return of(parentRequestResult);
    }
    // If there are children, execute requests for all children recursively
    return forkJoin(this.getNewChildFeatureRequests$(subChildren, relatedFeatures, parentRequestResult.feature))
      .pipe(
        map(subResults => {
          // Reduce the response to a single response per child. If one of them is false, the entire result will be false
          return subResults.reduce((prevResult, subResult) => {
            if (!subResult.success) {
              return { ...prevResult, success: false };
            }
            return prevResult;
          }, { success: parentRequestResult.success, feature: parentRequestResult.feature });
        }),
      );
  }

  private saveFeature$(feature: Feature, parentFeature?: Feature) {
    return this.formActionsService.save$(feature, parentFeature?.fid)
      .pipe(map(savedFeature => ({
        feature: savedFeature,
        success: !!savedFeature,
        message: !savedFeature ? `Kopieren van attributen naar ${feature.layerName} is niet gelukt` : undefined,
      })));
  }

}
