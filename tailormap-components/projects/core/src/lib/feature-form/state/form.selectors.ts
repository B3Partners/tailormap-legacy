import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FormState, formStateKey } from './form.state';
import { Feature } from '../../shared/generated';
import { selectFormConfigs, selectVisibleLayers } from '../../application/state/application.selectors';
import { FormRelationModel } from './form-relation.model';
import { TailormapAppLayer } from '../../application/models/tailormap-app-layer.model';

const selectFormState = createFeatureSelector<FormState>(formStateKey);

export const selectFeatures = createSelector(selectFormState, state => state.features);

export const selectCurrentFeature = createSelector(selectFormState, state => state.feature);

export const selectBulkEditDetails = createSelector(selectFormState, (state: FormState): [ string, string, 'sql' | 'cql' ] | null => {
  return typeof state.bulkEditFilter !== 'undefined' && typeof state.bulkEditFeatureTypeName !== 'undefined'
    ? [ state.bulkEditFilter, state.bulkEditFeatureTypeName, state.bulkEditFilterType ]
    : null;
});

export const selectInBulkEditMode = createSelector(
  selectFeatures,
  selectBulkEditDetails,
  (features: Feature[], bulkEditFilter: [ string, string, 'sql' | 'cql' ] | null): boolean => {
  return features.length > 1 || bulkEditFilter !== null;
});

export const selectFeatureFormEnabled = createSelector(selectFormState, state => state.formEnabled);

export const selectFormAlreadyDirty = createSelector(selectFormState, state => state.alreadyDirty);

export const selectCloseAfterSaveFeatureForm = createSelector(selectFormState, state => state.closeAfterSave);

export const selectIsMultiFormWorkflow = createSelector(selectFormState, state => state.multiFormWorkflow);

export const selectFormEditing = createSelector(selectFormState, state => state.editing);

export const selectFormVisible = createSelector(selectFormState, state => state.formVisible);

export const selectTreeVisible = createSelector(selectFormState, state => state.treeVisible);

export const selectFormConfigForFeature = createSelector(
  selectFormConfigs,
  selectCurrentFeature,
  (formConfigs, feature: Feature) => {
    return feature && formConfigs ? formConfigs.get(feature.tableName) : null;
  },
);

export const selectFeatureLabel = createSelector(
  selectFormConfigs,
  (formConfigs, feature: Feature): string => {
   return feature[formConfigs.get(feature.tableName)];
  },
);

export const selectCopyFormOpen = createSelector(selectFormState, state => state.copyFormOpen);
export const selectCopyFormOptionsOpen = createSelector(selectFormState, state => state.copyOptionsOpen);
export const selectParentCopyFeature = createSelector(selectFormState, state => state.copyFeature);
export const selectCurrentSelectedCopyFeatureAndFormConfig = createSelector(
  selectFormState,
  selectFormConfigs,
  (state, formConfigs) => {
    if (!state.copySelectedFeature) {
      return null;
    }
    return {
      feature: state.copySelectedFeature,
      formConfig: formConfigs.get(state.copySelectedFeature.tableName),
    };
  },
);
export const selectCopyDestinationFeatures = createSelector(selectFormState, state => state.copyDestinationFeatures);

export const selectRelationsFormOpen = createSelector(selectFormState, state => state.relationsFormOpen);
export const selectAllowedRelationSelectionFeatureTypes = createSelector(selectFormState, state => state.allowedRelationSelectionFeatureTypes);
export const selectCurrentlySelectedRelatedFeature = createSelector(selectFormState, state => state.currentlySelectedRelatedFeature);
export const selectHighlightNetwork = createSelector(selectFormState, state => state.highlightNetworkFeatures.map(f => f.geom));
export const selectCreateRelationsFeature = createSelector(selectFormState, state => {
  if (!state.features || state.features.length === 0) {
    return null;
  }
  return state.features[0];
});

export const selectFormRelationsForCurrentFeature = createSelector(
  selectVisibleLayers,
  selectCreateRelationsFeature,
  (layers: TailormapAppLayer[], feature: Feature | null): FormRelationModel | null => {
    if (feature === null) {
      return null;
    }
    const layerFeatureTypeNames = new Map(layers.map(layer => [layer.featureTypeName, layer.alias || layer.layerName]));
    const relations = feature.relations.filter(relation => {
      return relation.canCreateNewRelation
        && layerFeatureTypeNames.has(relation.foreignFeatureTypeName)
        && (!!relation.columnName && !!relation.foreignColumnName);
    });
    return {
      featureType: feature.tableName,
      relations: relations.map(relation => {
        const filter = relation.filter
          ? relation.filter.split('=').map(part => part.trim().replace(/['"]/g, ''))
          : [];
        let child: Feature | null = null;
        if (filter.length === 2) {
          child = feature.children.find(c => c.attributes.some(a => a.key === filter[0] && a.value === filter[1]));
        }
        return {
          featureType: relation.foreignFeatureTypeName,
          label: `${layerFeatureTypeNames.get(relation.foreignFeatureTypeName)} (${relation.columnName})`,
          column: relation.columnName,
          referenceColumn: relation.foreignColumnName,
          currentRelation: feature.attributes.find(a => a.key === relation.columnName)?.value,
          geometry: child ? child.defaultGeometry : null,
        };
      }),
    };
  },
);
