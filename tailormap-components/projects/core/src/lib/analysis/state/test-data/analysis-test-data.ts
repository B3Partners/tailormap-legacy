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
    geometryAttribute: 'geometrie',
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

export const analysisStateTestDataWithCreatedLayer: AnalysisState = {
  createLayerMode: CreateLayerModeEnum.ATTRIBUTES,
  selectDataSource: false,
  selectedDataSource: {
    layerId: 57,
    featureType: 55,
    label: 'gb_boom',
    geometryAttribute: 'geometrie',
    geometryType: AttributeTypeEnum.GEOMETRY,
  },
  layerName: 'Bomen uit 2010',
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
            source: 55,
            attribute: 'aanlegjaar',
            attributeType: AttributeTypeEnum.NUMBER,
            condition: '=',
            value: '2010',
          },
        ],
      },
    ],
  },
  styles: [{
    active: true,
    fillOpacity: 62,
    fillColor: 'rgb(255, 105, 105)',
    strokeColor: 'rgb(255, 105, 105)',
    strokeOpacity: 100,
    strokeWidth: 2,
    marker: 'star',
    markerSize: 8,
    markerFillColor: 'rgb(57, 73, 171)',
    markerStrokeColor: 'rgb(30, 30, 30)',
  }],
  isCreatingLayer: false,
  createLayerErrorMessage: '',
  createdAppLayer: '69',
}
