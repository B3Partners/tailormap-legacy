import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AttributelistState, attributelistStateKey } from './attributelist.state';

const selectAttributelistState = createFeatureSelector<AttributelistState>(attributelistStateKey);

export const selectAttributelistVisible = createSelector(selectAttributelistState, state => state.visible);
