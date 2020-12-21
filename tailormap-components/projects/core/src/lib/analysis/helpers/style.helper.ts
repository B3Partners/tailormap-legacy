import { AttributeTypeEnum } from '../../application/models/attribute-type.enum';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { UserLayerStyleModel } from '../models/user-layer-style.model';
import { rgbToHex } from '../../shared/util/color';

export class StyleHelper {

  public static showLineSettings(selectedDataSource: AnalysisSourceModel) {
    return selectedDataSource.geometryType === AttributeTypeEnum.GEOMETRY_LINESTRING
      || selectedDataSource.geometryType === AttributeTypeEnum.GEOMETRY_POLYGON
      || selectedDataSource.geometryType === AttributeTypeEnum.GEOMETRY;
  }

  public static showPolygonSettings(selectedDataSource: AnalysisSourceModel) {
    return selectedDataSource.geometryType === AttributeTypeEnum.GEOMETRY_POLYGON
      || selectedDataSource.geometryType === AttributeTypeEnum.GEOMETRY;
  }

  public static showPointSettings(selectedDataSource: AnalysisSourceModel) {
    return selectedDataSource.geometryType === AttributeTypeEnum.GEOMETRY_POINT
      || selectedDataSource.geometryType === AttributeTypeEnum.GEOMETRY;
  }

  public static createStyle(style: UserLayerStyleModel, selectedDataSource: AnalysisSourceModel) {
    if (!style) {
      return '';
    }
    const styleRules = [];
    const markerStyles = [];
    if (StyleHelper.showPolygonSettings(selectedDataSource)) {
      if (style.fillColor) {
        styleRules.push(`fill: ${rgbToHex(style.fillColor)};`);
      }
      if (style.fillOpacity) {
        styleRules.push(`fill-opacity: ${style.fillOpacity}%;`);
      }
    }
    if (StyleHelper.showLineSettings(selectedDataSource)) {
      if (style.strokeColor) {
        styleRules.push(`stroke: ${rgbToHex(style.strokeColor)};`);
      }
      if (style.strokeOpacity) {
        styleRules.push(`stroke-opacity: ${style.strokeOpacity}%;`);
      }
      if (style.strokeWidth) {
        styleRules.push(`stroke-width: ${style.strokeWidth}px;`);
      }
    }
    if (StyleHelper.showPointSettings(selectedDataSource)) {
      if (style.marker) {
        styleRules.push(`mark: symbol(${style.marker});`);
      }
      if (style.markerSize) {
        styleRules.push(`mark-size: ${style.markerSize};`);
      }
      if (style.markerFillColor) {
        markerStyles.push(`fill: ${rgbToHex(style.markerFillColor)};`);
      }
      if (style.markerStrokeColor) {
        markerStyles.push(`stroke: ${rgbToHex(style.markerStrokeColor)};`);
      }
    }
    const blocks = [ `* { ${styleRules.join(' ')} }` ];
    if (markerStyles.length > 0) {
      blocks.push(`:mark { ${markerStyles.join(' ')} }`);
    }
    return blocks.join(' ');
  }

}
