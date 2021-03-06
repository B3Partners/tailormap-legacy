import { createSpyObject } from '@ngneat/spectator';
import { NgZone } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';

export const createMockNgZoneProvider = () => {
  return createSpyObject(NgZone, {
  });
};

export const getNgZoneMockProvider = () => {
  return { provide: NgZone, useValue: createMockNgZoneProvider() };
};

export const createMockDialogRef = createSpyObject(MatDialogRef, {
  afterClosed(): Observable<any> {
    return new BehaviorSubject<boolean>(true).asObservable();
  },
});


export const createMockDialogProvider = createSpyObject(MatDialog, {
  getDialogById(params: number): MatDialogRef<any> {
    return createMockDialogRef;
  },
  open (params: any): MatDialogRef<any> {
    return createMockDialogRef;
  },
});
