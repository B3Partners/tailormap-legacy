import { AttributeTypeEnum } from '../../application/models/attribute-type.enum';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { UserLayerStyleModel } from '../models/user-layer-style.model';
import { rgbToHex } from '../../shared/util/color';
import { ScopedUserLayerStyleModel } from '../models/scoped-user-layer-style.model';

export class StyleHelper {

  public static getDefaultStyle(): UserLayerStyleModel {
    return {
      active: true,
      fillOpacity: 100,
      fillColor: 'rgb(255, 105, 105)',
      strokeColor: 'rgb(255, 105, 105)',
      strokeOpacity: 100,
      strokeWidth: 2,
      marker: 'circle',
      markerSize: 8,
      markerFillColor: 'rgb(255, 105, 105)',
      markerStrokeColor: 'rgb(30, 30, 30)',
    };
  }

  public static showLineSettings(geometryType: AttributeTypeEnum) {
    return geometryType === AttributeTypeEnum.GEOMETRY_LINESTRING
      || geometryType === AttributeTypeEnum.GEOMETRY_POLYGON
      || geometryType === AttributeTypeEnum.GEOMETRY;
  }

  public static showPolygonSettings(geometryType: AttributeTypeEnum) {
    return geometryType === AttributeTypeEnum.GEOMETRY_POLYGON
      || geometryType === AttributeTypeEnum.GEOMETRY;
  }

  public static showPointSettings(geometryType: AttributeTypeEnum) {
    return geometryType === AttributeTypeEnum.GEOMETRY_POINT
      || geometryType === AttributeTypeEnum.GEOMETRY;
  }

  public static isScopedStyle(style: UserLayerStyleModel): style is ScopedUserLayerStyleModel {
    return !!(style as ScopedUserLayerStyleModel).attribute;
  }

  public static convertStyles(styles: UserLayerStyleModel[], selectedDataSource: AnalysisSourceModel) {
    if (!styles || styles.length === 0) {
      return '';
    }
    return styles.map(style => StyleHelper.createStyle(style, selectedDataSource)).join(' ');
  }

  private static createStyle(style: UserLayerStyleModel, selectedDataSource: AnalysisSourceModel) {
    const styleRules = [];
    const markerStyles = [];
    let selector = '';
    if (StyleHelper.isScopedStyle(style)) {
      selector = style.attributeType === AttributeTypeEnum.STRING || style.attributeType === AttributeTypeEnum.DATE
        ? `[${style.attribute}='${style.value}'] `
        : `[${style.attribute}=${style.value}] `;
    }
    if (StyleHelper.showPolygonSettings(selectedDataSource.geometryType)) {
      const polygonStyles = [];
      if (style.fillColor) {
        polygonStyles.push(`fill: ${rgbToHex(style.fillColor)};`);
      }
      if (style.fillOpacity) {
        polygonStyles.push(`fill-opacity: ${style.fillOpacity}%;`);
      }
      if (polygonStyles.length > 0) {
        styleRules.push(`${selector}[dimension(${selectedDataSource.geometryAttribute})=2] { ${polygonStyles.join(' ')} }`);
      }
    }
    if (StyleHelper.showLineSettings(selectedDataSource.geometryType)) {
      const lineStyles = [];
      if (style.strokeColor) {
        lineStyles.push(`stroke: ${rgbToHex(style.strokeColor)};`);
      }
      if (style.strokeOpacity) {
        lineStyles.push(`stroke-opacity: ${style.strokeOpacity}%;`);
      }
      if (style.strokeWidth) {
        lineStyles.push(`stroke-width: ${style.strokeWidth}px;`);
      }
      if (lineStyles.length > 0) {
        styleRules.push(`${selector}[dimension(${selectedDataSource.geometryAttribute})=1] { ${lineStyles.join(' ')} }`);
      }
    }
    if (StyleHelper.showPointSettings(selectedDataSource.geometryType)) {
      const pointStyles = [];
      if (style.marker) {
        pointStyles.push(`mark: symbol(${style.marker});`);
      }
      if (style.markerSize) {
        pointStyles.push(`mark-size: ${style.markerSize};`);
      }
      if (style.markerFillColor) {
        markerStyles.push(`fill: ${rgbToHex(style.markerFillColor)};`);
      }
      if (style.markerStrokeColor) {
        markerStyles.push(`stroke: ${rgbToHex(style.markerStrokeColor)};`);
      }
      if (pointStyles.length > 0) {
        styleRules.push(`${selector}[dimension(${selectedDataSource.geometryAttribute})=0] { ${pointStyles.join(' ')} }`);
      }
      if (markerStyles.length > 0) {
        styleRules.push(`${selector}[dimension(${selectedDataSource.geometryAttribute})=0] :mark { ${markerStyles.join(' ')} }`);
      }
    }
    return styleRules.join(' ');
  }

}
