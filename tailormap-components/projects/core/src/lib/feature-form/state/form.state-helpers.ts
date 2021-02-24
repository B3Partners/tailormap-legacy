import { selectFeatureFormOpen } from './form.selectors';
import { pipe } from 'rxjs';
import { select } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { Feature } from '../../shared/generated';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';

export const selectFormClosed = pipe(
  select(selectFeatureFormOpen),
  filter(open => !open),
);

export const removeUnsavedFeatures = (features: Feature[]): Feature[] => {
  return features
    .filter(feature => feature.objectGuid !== FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT)
    .map(feature => ({
      ...feature,
      children: feature.children ? removeUnsavedFeatures(feature.children) : null,
    }));
}

export const updateFeatureInArray = (features: Feature[], newFeature: Feature): Feature[] => {
  const idx = features.findIndex(feature => feature.objectGuid === newFeature.objectGuid);

  return (idx !== -1 ?
      [...features.slice(0, idx), {...newFeature}, ...features.slice(idx + 1)]
      : features
  )
    .map(feature => ({
      ...feature,
      children: feature.children ? updateFeatureInArray(feature.children, newFeature) : null,
    }));
};
