import { createSpyObject } from '@ngneat/spectator';
import { MatDialogRef } from '@angular/material/dialog';
import { AttributeListService, AttributeListRowModel } from '@tailormap/core-components';
import { Observable, of } from 'rxjs';

export const createDialogRefMock = () => createSpyObject(MatDialogRef, {
  close: () => {},
});

export const getDialogRefMockProvider = () => {
  return { provide: MatDialogRef, useValue: createDialogRefMock() };
};

export const createAttributeListServiceMock = () => createSpyObject(AttributeListService, {
  getSelectedLayerId$: (): Observable<string> => {
    return of('1');
  },
  getCheckedRows$: (): Observable<AttributeListRowModel[]> => {
    return of([]);
  },
  registerComponent: () => {},
  getRegisteredComponents$: () => {
    return of([]);
  },
  setAttributeListVisible: () => {},
  getSelectedFeatureTypeTotalObjects$: () => {
    return of([]);
  },
});

export const getAttributeListServiceMockMockProvider = () => {
  return { provide: AttributeListService, useValue: createAttributeListServiceMock() };
};
