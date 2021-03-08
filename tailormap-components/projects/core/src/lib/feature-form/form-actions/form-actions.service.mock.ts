import { createSpyObject } from '@ngneat/spectator';
import { FormActionsService } from './form-actions.service';
import { Observable, of } from 'rxjs';

export const createFormActionsServiceMockProvider = () => {
  return createSpyObject(FormActionsService, {
    removeFeature$(): Observable<any> {
      return of({});
    },
    save$(): Observable<any> {
      return of({});
    },
  });
};

export const getFormActionsServiceMockProvider = () => {
  return { provide: FormActionsService, useValue: createFormActionsServiceMockProvider() };
};
