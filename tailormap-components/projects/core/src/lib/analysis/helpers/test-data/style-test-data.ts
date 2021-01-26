import { UserLayerStyleModel } from '../../models/user-layer-style.model';
import { ScopedUserLayerStyleModel } from '../../models/scoped-user-layer-style.model';
import { AttributeTypeEnum } from '../../../application/models/attribute-type.enum';
import { AnalysisSourceModel } from '../../models/analysis-source.model';

export const getDummyUserLayerStyle = (overrides?: Partial<UserLayerStyleModel>): UserLayerStyleModel => ({
  id: 'style-1',
  label: 'Stylelabel',
  active: true,
  fillColor: 'rgb(255, 125, 0)',
  fillOpacity: 100,
  marker: 'arrow',
  markerFillColor: 'rgb(255, 125, 0)',
  markerStrokeColor: 'rgb(255, 125, 0)',
  markerSize: 8,
  strokeColor: 'rgb(255, 125, 0)',
  strokeOpacity: 100,
  strokeWidth: 1,
  ...overrides,
});

export const getDummyScopedStyleModel = (overrides?: Partial<ScopedUserLayerStyleModel>): ScopedUserLayerStyleModel => ({
  ...getDummyUserLayerStyle(),
  label: 'test-value',
  attribute: 'test-attribute',
  attributeType: AttributeTypeEnum.GEOMETRY,
  value: 'test-value',
  ...overrides,
});

export const getDummySelectedDataSource = (overrides?: Partial<AnalysisSourceModel>): AnalysisSourceModel => ({
  featureType: 1,
  geometryAttribute: 'geometrie',
  geometryType: AttributeTypeEnum.GEOMETRY,
  label: 'boom',
  ...overrides,
});
