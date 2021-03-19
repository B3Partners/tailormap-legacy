import { analysisReducer } from './analysis.reducer';
import * as AnalysisActions from './analysis.actions';
import { initialAnalysisState } from './analysis.state';
import { StyleHelper } from '../helpers/style.helper';
import { IdService } from '../../shared/id-service/id.service';

const idService = new IdService();

describe('AnalysisReducer', () => {
  it('updates a property for all styles when calling updateAllStyles', () => {
    const action = AnalysisActions.updateAllStyles({ styleProp: 'fillColor', value: 'rgb(255, 255, 255)' });
    const state = {
      ...initialAnalysisState,
      styles: [
        { ...StyleHelper.getDefaultStyle(idService), fillColor: 'rgb(0, 0, 0)' },
        { ...StyleHelper.getDefaultStyle(idService), fillColor: 'rgb(0, 0, 0)' },
        { ...StyleHelper.getDefaultStyle(idService), fillColor: 'rgb(0, 0, 0)' },
        { ...StyleHelper.getDefaultStyle(idService), fillColor: 'rgb(0, 0, 0)' },
      ],
    };
    const updatedState = analysisReducer(state, action);
    const updatedFillColors = updatedState.styles.map(s => s.fillColor);
    expect(updatedFillColors).toEqual([ 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)' ]);
  });
});
