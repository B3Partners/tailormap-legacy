import { createSpyObject } from '@ngneat/spectator';
import { MatDialogRef } from '@angular/material/dialog';

export const createDialogRefMock = () => createSpyObject(MatDialogRef, {
  close: () => {},
});

export const getDialogRefMockProvider = () => {
  return { provide: MatDialogRef, useValue: createDialogRefMock() };
};
