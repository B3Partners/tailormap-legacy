import { AttributeTypeEnum } from '../../application/models/attribute-type.enum';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { MakerType, UserLayerStyleModel } from '../models/user-layer-style.model';
import { rgbToHex } from '../../shared/util/color';
import { ScopedUserLayerStyleModel } from '../models/scoped-user-layer-style.model';
import { IdService } from '../../shared/id-service/id.service';
import { AttributeTypeHelper } from '../../application/helpers/attribute-type.helper';

export class StyleHelper {

  public static getAvailableMarkers(): Array<{ value: MakerType, icon: string }> {
    return [
      { value: 'circle', icon: 'markers_circle' },
      { value: 'square', icon: 'markers_square' },
      { value: 'triangle', icon: 'markers_triangle' },
      { value: 'arrow', icon: 'markers_arrow' },
      { value: 'cross', icon: 'markers_cross' },
      { value: 'star', icon: 'markers_star' },
    ];
  }

  public static getMarkerDictionary(): Map<MakerType, string> {
    return new Map<MakerType, string>(StyleHelper.getAvailableMarkers().map(marker => ([ marker.value, marker.icon ])));
  }

  public static getDefaultStyle(idService: IdService, color?: string): UserLayerStyleModel {
    return {
      id: idService.getUniqueId('style'),
      label: '',
      active: true,
      fillOpacity: 100,
      fillColor: color || 'rgb(255, 105, 105)',
      strokeColor: color || 'rgb(255, 105, 105)',
      strokeOpacity: 100,
      strokeWidth: 2,
      marker: 'circle',
      markerSize: 8,
      markerFillColor: color || 'rgb(255, 105, 105)',
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

  public static getStyleLabel(style: UserLayerStyleModel) {
    if (!style) {
      return '';
    }
    if (StyleHelper.isScopedStyle(style)) {
      return style.value;
    }
    return style.id;
  }

  public static convertStyles(styles: UserLayerStyleModel[], selectedDataSource: AnalysisSourceModel) {
    if (!styles || styles.length === 0) {
      return '';
    }
    const stylingRules = styles
      .filter(style => style.active)
      .map(style => StyleHelper.createStyle(style, selectedDataSource)).join(' ');
    if (stylingRules.trim() === '') {
      return '';
    }
    return `@mode "Flat"; ${stylingRules}`;
  }

  private static createStyle(style: UserLayerStyleModel, selectedDataSource: AnalysisSourceModel) {
    const styleRules = [];
    const markerStyles = [];
    let selector = '';
    const titleAnnotation = `/* @title ${style.label} */ `;
    if (StyleHelper.isScopedStyle(style)) {
      selector = `[${style.attribute}=${AttributeTypeHelper.getExpression(style.value, style.attributeType)}] `;
    }
    if (style.maxScale && style.maxScale > 0) {
      selector = `${selector}[@sd <= ${style.maxScale}] `
    }
    if (style.minScale && style.minScale > 0) {
      selector = `${selector}[@sd > ${style.minScale}] `
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
        const polygonLineRules = StyleHelper.getLineStyles(style).join(' ');
        styleRules.push([
          `${titleAnnotation}`,
          `${selector}`,
          `[dimension(${selectedDataSource.geometryAttribute})=2] `,
          `{ ${polygonStyles.join(' ')} ${polygonLineRules} }`,
        ].join(''));
      }
    }
    if (StyleHelper.showLineSettings(selectedDataSource.geometryType)) {
      const lineStyles = StyleHelper.getLineStyles(style);
      if (lineStyles.length > 0) {
        styleRules.push([
          `${titleAnnotation}`,
          `${selector}[dimension(${selectedDataSource.geometryAttribute})=1] { ${lineStyles.join(' ')} }`,
          ``,
        ].join(''));
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
        styleRules.push(`${titleAnnotation}${selector}[dimension(${selectedDataSource.geometryAttribute})=0] { ${pointStyles.join(' ')} }`);
      }
      if (markerStyles.length > 0) {
        styleRules.push(`${selector}[dimension(${selectedDataSource.geometryAttribute})=0] :mark { ${markerStyles.join(' ')} }`);
      }
    }
    return styleRules.join(' ');
  }

  private static getLineStyles(style: UserLayerStyleModel): string[] {
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
    return lineStyles;
  }

}
