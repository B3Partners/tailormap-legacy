import { selectFeatureFormEnabled } from './form.selectors';
import { pipe } from 'rxjs';
import { select } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { Feature } from '../../shared/generated';

export const selectFormClosed = pipe(
  select(selectFeatureFormEnabled),
  filter(open => !open),
);

export const removeFeature = (features: Feature[], removed: Feature): Feature[] => {
  const idx = features.findIndex(feature => feature.fid === removed.fid);
  const updatedFeatures = idx !== -1
    ? [...features.slice(0, idx), ...features.slice(idx + 1)]
    : features;
  return updatedFeatures.map(feature => ({
      ...feature,
      children: feature.children ? removeFeature(feature.children, removed) : null,
    }));
};

export const updateFeatureInArray = (features: Feature[], updatedFeature: Feature): Feature[] => {
  const idx = features.findIndex(feature => feature.fid === updatedFeature.fid);
  const updatedFeatures = idx !== -1
      ? [...features.slice(0, idx), { ...updatedFeature }, ...features.slice(idx + 1)]
      : features;
  return updatedFeatures.map(feature => ({
      ...feature,
      children: feature.children ? updateFeatureInArray(feature.children, updatedFeature) : null,
    }));
};

export const addFeatureToParent = (features: Feature[], newFeature: Feature, parentId: string): Feature[] => {
  const idx = features.findIndex(feature => feature.fid === parentId);
  const updatedFeatures = idx !== -1
    ? [...features.slice(0, idx), { ...features[idx], children: [...features[idx].children, newFeature] }, ...features.slice(idx + 1)]
    : features;
  return updatedFeatures.map(feature => ({
      ...feature,
      children: feature.children ? addFeatureToParent(feature.children, newFeature, parentId) : null,
    }));
};
