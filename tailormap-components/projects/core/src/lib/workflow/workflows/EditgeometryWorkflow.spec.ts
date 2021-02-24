import { WorkflowFactoryService } from '../workflow-factory/workflow-factory.service';
import { createServiceFactory, createSpyObject, SpectatorService } from '@ngneat/spectator';
import { EditgeometryWorkflow } from './EditgeometryWorkflow';
import { FeatureControllerService } from '../../shared/generated';
import { GeometryConfirmService } from '../../user-interface/geometry-confirm-buttons/geometry-confirm.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { mockBoom, vectorLayerMock } from '../../shared/tests/test-data';
import { OLFeature } from '../../../../../bridge/typings';
import { Coordinate } from '../../user-interface/models';
import { createMockDialogProvider } from './mocks/workflow.mock';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { formStateKey, initialFormState } from '../../feature-form/state/form.state';
import { WORKFLOW_ACTION } from '../state/workflow-models';
import { initialWorkflowState, workflowStateKey } from '../state/workflow.state';
import { applicationStateKey, initialApplicationState } from '../../application/state/application.state';

describe('EditgeometryWorkflow', () => {
  let workflow: EditgeometryWorkflow;
  let factory: SpectatorService<WorkflowFactoryService>;

  const initialState = {
    [formStateKey]: initialFormState,
    [workflowStateKey]: {...initialWorkflowState, feature: mockBoom()},
    [applicationStateKey]: initialApplicationState,
  };
  let store: MockStore;
  const vectorLayer = vectorLayerMock({
    getActiveFeature(): OLFeature {
      return {color: '', config: {wktgeom: '', id: 'string', attributes: {}}}
    },
  });

  const geometryConfirmService = createSpyObject(GeometryConfirmService, {
    open$(coord: Coordinate): Observable<boolean> {
      return new BehaviorSubject<boolean>(true).asObservable();
    },
  });
  const createService = createServiceFactory({
    service: WorkflowFactoryService,
    mocks: [
      MatSnackBar,
      FeatureControllerService,
      ConfirmDialogService,
    ],
    providers: [
      provideMockStore({ initialState }),
      getTailorMapServiceMockProvider(),
      {provide: GeometryConfirmService, useValue: geometryConfirmService},
      FeatureInitializerService,
      {provide: MatDialog, useValue: createMockDialogProvider},
      {provide: MatDialogRef, useValue: {}},
      {provide: MAT_DIALOG_DATA, useValue: {title: '', message: ''}},
    ],
  })

  beforeEach(() => {
    factory = createService();
    factory.service.vectorLayer = vectorLayer;
    factory.service.highlightLayer = vectorLayer;

    store = factory.inject(MockStore);

    workflow = factory.service.getWorkflow(WORKFLOW_ACTION.EDIT_GEOMETRY, 'wegvakonderdeel') as EditgeometryWorkflow;
    expect(workflow instanceof EditgeometryWorkflow).toBe(true, 'instance of EditgeometryWorkflow');
  });


  it('should be created', () => {
    expect(workflow).toBeTruthy();
  });

  it('drawGeom call should result opening a dialog', () => {
    const vectorSpy = spyOn(vectorLayer, 'readGeoJSON');
    workflow.drawGeom();

    expect(vectorSpy).toHaveBeenCalled();
  });

});
