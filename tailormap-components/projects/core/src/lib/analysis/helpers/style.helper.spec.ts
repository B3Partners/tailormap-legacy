import { UserLayerStyleModel } from '../models/user-layer-style.model';
import { ScopedUserLayerStyleModel } from '../models/scoped-user-layer-style.model';
import { AttributeTypeEnum } from '../../application/models/attribute-type.enum';
import { StyleHelper } from './style.helper';
import { AnalysisSourceModel } from '../models/analysis-source.model';

const baseStyleModel: UserLayerStyleModel = {
  id: 'style-1',
  active: true,
  fillColor: 'rgb(255, 125, 0)',
  fillOpacity: 100,
  marker: 'arrow',
  markerFillColor: 'rgb(255, 125, 0)',
  markerStrokeColor: 'rgb(255, 125, 0)',
  markerSize: 8,
  strokeColor: 'rgb(255, 125, 0)',
  strokeOpacity: 100,
  strokeWidth: 1
};

const baseScopedStyleModel: ScopedUserLayerStyleModel = {
  ...baseStyleModel,
  attribute: 'test-attribute',
  attributeType: AttributeTypeEnum.GEOMETRY,
  value: 'test-value',
};

const selectedDataSource: AnalysisSourceModel = {
  featureType: 1,
  geometryAttribute: "geometrie",
  geometryType: AttributeTypeEnum.GEOMETRY,
  label: 'boom'
};

const expectedPolygonResult = (extraSelector: string = '') => `${extraSelector}[dimension(geometrie)=2] { fill: #ff7d00; fill-opacity: 100%; }`;
const expectedLineResult = (extraSelector: string = '') => `${extraSelector}[dimension(geometrie)=1], ${extraSelector}[dimension(geometrie)=2] { stroke: #ff7d00; stroke-opacity: 100%; stroke-width: 1px; }`;
const expectedPointResult = (extraSelector: string = '') => `${extraSelector}[dimension(geometrie)=0] { mark: symbol(arrow); mark-size: 8; } ${extraSelector}[dimension(geometrie)=0] :mark { fill: #ff7d00; stroke: #ff7d00; }`;

describe('StyleHelper', () => {
  it('does not create style when styles is empty', () => {
    const result = StyleHelper.convertStyles([], selectedDataSource);
    expect(result).toEqual('');
  });
  it('does not create style when style is not active', () => {
    const result = StyleHelper.convertStyles([ { ...baseStyleModel, active: false }], selectedDataSource);
    expect(result).toEqual('');
  });
  it('creates style for style model', () => {
    const result = StyleHelper.convertStyles([ { ...baseStyleModel }], selectedDataSource);
    const expectedResult = [ expectedPolygonResult(), expectedLineResult(), expectedPointResult() ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for style model with point selected data source', () => {
    const result = StyleHelper.convertStyles([ { ...baseStyleModel }], { ...selectedDataSource, geometryType: AttributeTypeEnum.GEOMETRY_POINT });
    const expectedResult = [ expectedPointResult() ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for style model with polygon selected data source', () => {
    const result = StyleHelper.convertStyles([ { ...baseStyleModel }], { ...selectedDataSource, geometryType: AttributeTypeEnum.GEOMETRY_POLYGON });
    const expectedResult = [ expectedPolygonResult(), expectedLineResult() ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for style model with line selected data source', () => {
    const result = StyleHelper.convertStyles([ { ...baseStyleModel }], { ...selectedDataSource, geometryType: AttributeTypeEnum.GEOMETRY_LINESTRING });
    const expectedResult = [ expectedLineResult() ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for style model with min scale', () => {
    const result = StyleHelper.convertStyles([ { ...baseStyleModel, minScale: 1500 }], selectedDataSource);
    const expectedResult = [
      `${expectedPolygonResult('[@sd > 1500] ')}`,
      `${expectedLineResult('[@sd > 1500] ')}`,
      `${expectedPointResult('[@sd > 1500] ')}`,
    ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for style model with max scale', () => {
    const result = StyleHelper.convertStyles([ { ...baseStyleModel, maxScale: 5000 }], selectedDataSource);
    const expectedResult = [
      `${expectedPolygonResult('[@sd <= 5000] ')}`,
      `${expectedLineResult('[@sd <= 5000] ')}`,
      `${expectedPointResult('[@sd <= 5000] ')}`,
    ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for style model with min and max scale', () => {
    const result = StyleHelper.convertStyles([ { ...baseStyleModel, minScale: 1500, maxScale: 5000 }], selectedDataSource);
    const expectedResult = [
      `${expectedPolygonResult('[@sd <= 5000] [@sd > 1500] ')}`,
      `${expectedLineResult('[@sd <= 5000] [@sd > 1500] ')}`,
      `${expectedPointResult('[@sd <= 5000] [@sd > 1500] ')}`,
    ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for scoped style', () => {
    const result = StyleHelper.convertStyles([ { ...baseScopedStyleModel }], selectedDataSource);
    const expectedResult = [
      `${expectedPolygonResult('[test-attribute=test-value] ')}`,
      `${expectedLineResult('[test-attribute=test-value] ')}`,
      `${expectedPointResult('[test-attribute=test-value] ')}`,
    ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
});
