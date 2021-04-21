/* eslint max-len: 0 */

import { AttributeTypeEnum } from '../../shared/models/attribute-type.enum';
import { StyleHelper } from './style.helper';
import { getDummyScopedStyleModel, getDummyUserLayerStyle, getDummySelectedDataSource } from './test-data/style-test-data';

const userLayerStyle = getDummyUserLayerStyle();
const selectedDataSource = getDummySelectedDataSource();

const expectedPolygonResult = (label: string = userLayerStyle.label, extraSelector: string = '') => `/* @title ${label} */ ${extraSelector}[dimension(geometrie)=2] { fill: #ff7d00; fill-opacity: 100%; stroke: #ff7d00; stroke-opacity: 100%; stroke-width: 1px; }`;
const expectedLineResult = (label: string = userLayerStyle.label, extraSelector: string = '') => `/* @title ${label} */ ${extraSelector}[dimension(geometrie)=1] { stroke: #ff7d00; stroke-opacity: 100%; stroke-width: 1px; }`;
const expectedPointResult = (label: string = userLayerStyle.label, extraSelector: string = '') => `/* @title ${label} */ ${extraSelector}[dimension(geometrie)=0] { mark: symbol(arrow); mark-size: 8; } ${extraSelector}[dimension(geometrie)=0] :mark { fill: #ff7d00; stroke: #ff7d00; }`;

describe('StyleHelper', () => {
  it('does not create style when styles is empty', () => {
    const result = StyleHelper.convertStyles([], selectedDataSource);
    expect(result).toEqual('');
  });
  it('does not create style when style is not active', () => {
    const result = StyleHelper.convertStyles([ getDummyUserLayerStyle({ active: false })], selectedDataSource);
    expect(result).toEqual('');
  });
  it('creates style for style model', () => {
    const result = StyleHelper.convertStyles([ { ...userLayerStyle }], selectedDataSource);
    const expectedResult = [ '@mode "Flat";', expectedPolygonResult(), expectedLineResult(), expectedPointResult() ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for style model with point selected data source', () => {
    const result = StyleHelper.convertStyles([ { ...userLayerStyle }], getDummySelectedDataSource({ geometryType: AttributeTypeEnum.GEOMETRY_POINT }));
    const expectedResult = [ '@mode "Flat";', expectedPointResult() ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for style model with polygon selected data source', () => {
    const result = StyleHelper.convertStyles([ { ...userLayerStyle }], getDummySelectedDataSource({ geometryType: AttributeTypeEnum.GEOMETRY_POLYGON }));
    const expectedResult = [ '@mode "Flat";', expectedPolygonResult(), expectedLineResult() ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for style model with line selected data source', () => {
    const result = StyleHelper.convertStyles([ { ...userLayerStyle }], getDummySelectedDataSource({ geometryType: AttributeTypeEnum.GEOMETRY_LINESTRING }));
    const expectedResult = [ '@mode "Flat";', expectedLineResult() ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for style model with min scale', () => {
    const result = StyleHelper.convertStyles([ getDummyUserLayerStyle({ minScale: 1500 }) ], selectedDataSource);
    const expectedResult = [
      '@mode "Flat";',
      `${expectedPolygonResult(userLayerStyle.label, '[@sd > 1500] ')}`,
      `${expectedLineResult(userLayerStyle.label, '[@sd > 1500] ')}`,
      `${expectedPointResult(userLayerStyle.label, '[@sd > 1500] ')}`,
    ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for style model with max scale', () => {
    const result = StyleHelper.convertStyles([ getDummyUserLayerStyle({ maxScale: 5000 })], selectedDataSource);
    const expectedResult = [
      '@mode "Flat";',
      `${expectedPolygonResult(userLayerStyle.label, '[@sd <= 5000] ')}`,
      `${expectedLineResult(userLayerStyle.label, '[@sd <= 5000] ')}`,
      `${expectedPointResult(userLayerStyle.label, '[@sd <= 5000] ')}`,
    ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for style model with min and max scale', () => {
    const result = StyleHelper.convertStyles([ getDummyUserLayerStyle({ minScale: 1500, maxScale: 5000 }) ], selectedDataSource);
    const expectedResult = [
      '@mode "Flat";',
      `${expectedPolygonResult(userLayerStyle.label, '[@sd <= 5000] [@sd > 1500] ')}`,
      `${expectedLineResult(userLayerStyle.label, '[@sd <= 5000] [@sd > 1500] ')}`,
      `${expectedPointResult(userLayerStyle.label, '[@sd <= 5000] [@sd > 1500] ')}`,
    ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style for scoped style', () => {
    const result = StyleHelper.convertStyles([ getDummyScopedStyleModel() ], selectedDataSource);
    const expectedResult = [
      '@mode "Flat";',
      `${expectedPolygonResult('test-value', '[test-attribute=test-value] ')}`,
      `${expectedLineResult('test-value', '[test-attribute=test-value] ')}`,
      `${expectedPointResult('test-value', '[test-attribute=test-value] ')}`,
    ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
  it('creates style with label', () => {
    const style = getDummyUserLayerStyle({ label: 'Layername' });
    const result = StyleHelper.convertStyles([ style ], selectedDataSource);
    const expectedResult = [
      '@mode "Flat";',
      `${expectedPolygonResult('Layername')}`,
      `${expectedLineResult('Layername')}`,
      `${expectedPointResult('Layername')}`,
    ].join(' ');
    expect(result.toLowerCase()).toEqual(expectedResult.toLowerCase());
  });
});
