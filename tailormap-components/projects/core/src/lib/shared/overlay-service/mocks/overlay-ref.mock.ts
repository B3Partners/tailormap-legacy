import { createSpyObject } from '@ngneat/spectator';
import { of } from 'rxjs';
import { OverlayRef } from '../overlay-ref';


export const createOverlayRefProvider = (overrides?: Partial<Record<keyof OverlayRef, any>>) => {
  return createSpyObject(OverlayRef, {
    data: null,
    close() {},
    afterClosed$: of(null),
    isOpen: true,
    overlay: null,
    ...overrides,
  })
};

export const getOverlayRefProvider = (overrides?: Partial<Record<keyof OverlayRef, any>>) => {
  return { provide: OverlayRef, useValue: createOverlayRefProvider(overrides) };
};
