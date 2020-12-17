import { AnalysisState } from '../analysis.state';
import { CreateLayerModeEnum } from '../../models/create-layer-mode.enum';
import { CriteriaTypeEnum } from '../../models/criteria-type.enum';
import { CriteriaOperatorEnum } from '../../models/criteria-operator.enum';
import { AttributeTypeEnum } from '../../../application/models/attribute-type.enum';

export const analysisStateTestData: AnalysisState = {
  createLayerMode: CreateLayerModeEnum.ATTRIBUTES,
  selectDataSource: false,
  selectedDataSource: {
    layerId: 9,
    featureType: 302,
    label: 'gb_wegvakonderdeel',
    geometryType: AttributeTypeEnum.GEOMETRY_LINESTRING,
  },
  createCriteriaMode: null,
  criteria: {
    type: CriteriaTypeEnum.SIMPLE,
    operator: CriteriaOperatorEnum.AND,
    groups: [
      {
        id: 'criteria-group-1',
        operator: CriteriaOperatorEnum.AND,
        criteria: [
          {
            id: 'criteria-1',
            source: 302,
            attribute: 'aanlegjaar',
            attributeType: AttributeTypeEnum.NUMBER,
            condition: '=',
            value: '2000',
          },
        ],
      },
    ],
  },
  layerName: 'test laag 2000',
};
