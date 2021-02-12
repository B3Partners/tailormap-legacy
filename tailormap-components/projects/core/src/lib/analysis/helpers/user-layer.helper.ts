import { AttributeMetadataResponse } from '../../shared/attribute-service/attribute-models';
import { AttributeTypeHelper } from '../../application/helpers/attribute-type.helper';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { AppLayer } from '../../../../../bridge/typings';

export class UserLayerHelper {
  public static createUserLayerSourceFromMetadata(attributeMetadata: AttributeMetadataResponse, appLayer: AppLayer): AnalysisSourceModel {
    const geomAttribute = attributeMetadata.attributes[attributeMetadata.geometryAttributeIndex];
    let geometryType;
    let geomAttributeName;
    if (geomAttribute) {
      geometryType = AttributeTypeHelper.getGeometryAttributeType(geomAttribute);
      geomAttributeName = geomAttribute.name;
    }
    return  {
      layerId: +(appLayer.id),
      featureType: appLayer.featureType,
      label: appLayer.alias,
      geometryType,
      geometryAttribute: geomAttributeName,
    };
  }
}
