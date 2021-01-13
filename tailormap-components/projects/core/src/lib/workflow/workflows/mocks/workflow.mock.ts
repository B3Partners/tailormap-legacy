import { createSpyObject } from '@ngneat/spectator';
import { NgZone } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

export const createMockNgZoneProvider = () => {
  return createSpyObject(NgZone, {
  });
};

export const getNgZoneMockProvider = () => {
  return { provide: NgZone, useValue: createMockNgZoneProvider() };
};

export const createMockDialogProvider = createSpyObject(MatDialog, {
  getDialogById(params: number): MatDialogRef<any> {
    return createSpyObject(MatDialogRef, {
      // tslint:disable-next-line:rxjs-finnish
      afterClosed(): Observable<any> {
        return createSpyObject(Observable);
      },
    });
  },
});
