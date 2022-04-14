import { selectFeatureFormEnabled, selectFormEditing } from './form.selectors';
import { pipe } from 'rxjs';
import { select } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { Feature } from '../../shared/generated';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';

export const selectFormClosed = pipe(
  select(selectFeatureFormEnabled),
  filter(open => !open),
);

export const selectFormEditingDone = pipe(
  select(selectFormEditing),
  filter(editing => !editing),
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
  if (!features || features.length === 0) {
    return [ newFeature ];
  }
  if (features[0].fid === newFeature.fid) {
    // Main feature -> update
    return addOrUpdate(features, newFeature);
  }
  if (parentId === null
    && newFeature.fid !== FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT) {
    // Existing child feature -> recursive update
    return updateChildFeature(features, newFeature);
  }
  // New child feature -> add
  return addChildFeature(features, newFeature, parentId);
};

const addChildFeature = (features: Feature[], newFeature: Feature, parentId: string): Feature[] => {
  const idx = features.findIndex(feature => feature.fid === parentId);
  if (idx !== -1) {
    return [
      ...features.slice(0, idx),
      { ...features[idx], children: addOrUpdate(features[idx].children, newFeature) },
      ...features.slice(idx + 1),
    ];
  }
  return features.map(feature => ({
    ...feature,
    children: feature.children
      ? addChildFeature(feature.children, newFeature, parentId)
      : null,
  }));
};

const updateChildFeature = (features: Feature[], updatedFeature: Feature): Feature[] => {
  return features.map(feature => {
    if (feature.fid === updatedFeature.fid) {
      return updatedFeature;
    }
    return {
      ...feature,
      children: feature.children
        ? updateChildFeature(feature.children, updatedFeature)
        : null,
    };
  });
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
