import { Injectable } from '@angular/core';
import { Feature, Field } from '../../shared/generated';
import { FormActionsService } from '../form-actions/form-actions.service';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

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
  ): Observable<{ success: boolean; message?: string }>[] {
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
    const childsToCopy$ = this.getNewChildFeatures$(baseFeature, relatedFeatures);
    for (let i  = 0; i <= destinationFeatures.length - 1; i++) {
      const copyDestinationFeature: Feature = {
        ...destinationFeatures[i],
        attributes: destinationFeatures[i].attributes.map(field => ({
          key: field.key,
          value: valuesToCopy.has(field.key) ? valuesToCopy.get(field.key) : field.value,
          type: field.type,
        })),
      };
      childsToCopy$.forEach(childToCopy$ => {
        requests$.push(
          childToCopy$.pipe(concatMap(childToCopy => this.saveFeature$([ childToCopy ], copyDestinationFeature))),
        );
      });
      requests$.push(this.saveFeature$([copyDestinationFeature], copyDestinationFeature));
    }
    return requests$;
  }

  private getDeleteFeatureRequest$(destinationFeature: Feature): Observable<{ success: boolean; message?: string }>[] {
    return destinationFeature.children.map(child => {
      return this.formActionsService.removeFeature$(child).pipe(map(result => {
        return {
          success: result,
          message: !result ? `Fout bij verwijderen van gerelateerd object voor ${destinationFeature.layerName}` : undefined,
        };
      }));
    });
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

  private getNewChildFeatures$(baseFeature: Feature, relatedFeatures: string[]): Observable<Feature>[] {
    return baseFeature.children
      .filter(child => relatedFeatures.findIndex(r => child.fid === r) !== -1)
      .map(child => {
        const valuesToCopy = {};
        this.getPropertiesToMerge(child).forEach((value, key) => {
          valuesToCopy[key] = value;
        });
        return this.featureInitializer.create$(child.tableName, valuesToCopy);
      });
  }

  private saveFeature$(children: Feature[], destinationFeature: Feature) {
    return this.formActionsService.save$(false, children, destinationFeature)
      .pipe(map(result => ({
        success: result,
        message: !result ? `Kopieren van attributen naar ${destinationFeature.layerName} is niet gelukt` : undefined,
      })));
  }

}
