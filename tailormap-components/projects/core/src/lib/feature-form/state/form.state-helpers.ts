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

export const addOrUpdateFeature = (features: Feature[], newFeature: Feature, parentId: string): Feature[] => {
  if (parentId === null) {
    return addOrUpdate(features, newFeature);
  }
  const idx = features.findIndex(feature => feature.fid === parentId);
  const updatedFeatures = idx !== -1
    ? [
        ...features.slice(0, idx),
        { ...features[idx], children: addOrUpdate(features[idx].children, newFeature) },
        ...features.slice(idx + 1),
      ]
    : features;
  return updatedFeatures.map(feature => ({
      ...feature,
      children: feature.children ? addOrUpdateFeature(feature.children, newFeature, parentId) : null,
    }));
};

const addOrUpdate = (features: Feature[], newFeature: Feature): Feature[] => {
  const idx = features.findIndex(f => f.fid === newFeature.fid);
  if (idx === -1) {
    return [ ...features, newFeature ];
  }
  return [
    ...features.slice(0, idx),
    { ...newFeature },
    ...features.slice(idx + 1),
  ];
};
