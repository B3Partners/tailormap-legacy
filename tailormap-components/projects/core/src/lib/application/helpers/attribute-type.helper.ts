import { Attribute } from '../../shared/attribute-service/attribute-models';
import { AttributeTypeEnum } from '../models/attribute-type.enum';

export class AttributeTypeHelper {

  private static administrativeTypes: AttributeTypeEnum[] = [
    AttributeTypeEnum.NUMBER,
    AttributeTypeEnum.DATE,
    AttributeTypeEnum.STRING,
    AttributeTypeEnum.BOOLEAN,
  ];

  private static geometryTypes: AttributeTypeEnum[] = [
    AttributeTypeEnum.GEOMETRY_POINT,
    AttributeTypeEnum.GEOMETRY_LINESTRING,
    AttributeTypeEnum.GEOMETRY_POLYGON,
  ];

  public static getLabelForAttributeType(attributeType: AttributeTypeEnum): string {
    switch (attributeType) {
      case AttributeTypeEnum.STRING:
        return 'tekst';
      case AttributeTypeEnum.NUMBER:
        return 'nummer';
      case AttributeTypeEnum.DATE:
        return 'datum';
      case AttributeTypeEnum.BOOLEAN:
        return 'boolean';
      case AttributeTypeEnum.GEOMETRY_POINT:
        return 'punt';
      case AttributeTypeEnum.GEOMETRY_LINESTRING:
        return 'lijn';
      case AttributeTypeEnum.GEOMETRY_POLYGON:
        return 'vlag';
    }
    return '';
  }

  public static getAttributeType(attribute?: Attribute): AttributeTypeEnum {
    if (!attribute) {
      return undefined;
    }
    if (attribute.type === 'string') {
      return AttributeTypeEnum.STRING;
    }
    if (attribute.type === 'double' || attribute.type === 'integer') {
      return AttributeTypeEnum.NUMBER;
    }
    if (attribute.type === 'boolean') {
      return AttributeTypeEnum.BOOLEAN;
    }
    if (attribute.type === 'date' || attribute.type === 'timestamp') {
      return AttributeTypeEnum.DATE;
    }
    if (attribute.type === 'point' || attribute.type === 'multipoint') {
      return AttributeTypeEnum.GEOMETRY_POINT;
    }
    if (attribute.type === 'linestring' || attribute.type === 'multilinestring') {
      return AttributeTypeEnum.GEOMETRY_LINESTRING;
    }
    if (attribute.type === 'polygon' || attribute.type === 'multipolygon') {
      return AttributeTypeEnum.GEOMETRY_POLYGON;
    }
    return undefined;
  }

  public static getAdministrativeAttributeType(attribute?: Attribute): AttributeTypeEnum {
    return AttributeTypeHelper.getAttributeForAllowedType(AttributeTypeHelper.administrativeTypes, attribute);
  }

  public static getGeometryAttributeType(attribute?: Attribute): AttributeTypeEnum {
    return AttributeTypeHelper.getAttributeForAllowedType(AttributeTypeHelper.geometryTypes, attribute);
  }

  private static getAttributeForAllowedType(allowedTypes: AttributeTypeEnum[], attribute?: Attribute) {
    const attributeType = AttributeTypeHelper.getAttributeType(attribute);
    if (allowedTypes.indexOf(attributeType) === -1) {
      return undefined;
    }
    return attributeType;
  }

}
