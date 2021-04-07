import { ApplicationState, initialApplicationState } from './application.state';
import { applicationReducer } from './application.reducer';
import { updateLayerFilter } from './application.actions';
import { appLayerMock } from '../../shared/tests/test-data';

let initialState: ApplicationState;

describe('ApplicationReducer', () => {

  beforeEach(() => {
    initialState = { ...initialApplicationState };
  });

  it('handles update layer filter action', () => {
    const stateWithLayer: ApplicationState = {
      ...initialState,
      layers: [
        { ...appLayerMock({ id: '123' }), visible: true },
      ],
    };
    const result = applicationReducer(stateWithLayer, updateLayerFilter({ layerId: '123', filter: 'this is my filter' }));
    expect(result.layers[0].cqlFilter).toEqual('this is my filter');
  });

});
