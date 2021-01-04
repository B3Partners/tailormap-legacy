import { AttributeMetadataResponse } from '../../shared/attribute-service/attribute-models';
import { AttributeTypeHelper } from '../../application/helpers/attribute-type.helper';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { AppLayer } from '../../../../../bridge/typings';

export class UserLayerHelper {
  public static createUserLayerSourceFromMetadata(attributeMetadata: AttributeMetadataResponse, appLayer: AppLayer): AnalysisSourceModel {
    const geomAttribute = attributeMetadata.attributes[attributeMetadata.geometryAttributeIndex];
    let geometryType;
    if (geomAttribute) {
      geometryType = AttributeTypeHelper.getGeometryAttributeType(geomAttribute);
    }
    return  {
      layerId: +(appLayer.id),
      featureType: appLayer.featureType,
      label: appLayer.alias,
      geometryType,
      geometryAttribute: geomAttribute.name,
    };
  }
}
