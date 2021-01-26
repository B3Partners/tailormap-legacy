import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeometryConfirmButtonsComponent } from './geometry-confirm-buttons.component';
import { createComponentFactory, createSpyObject, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../shared/shared.module';
import { GeometryConfirmService } from './geometry-confirm.service';
import { of } from 'rxjs';

describe('GeometryConfirmButtonsComponent', () => {
  let spectator: Spectator<GeometryConfirmButtonsComponent>;
  const geometryConfirmServiceMock = createSpyObject(GeometryConfirmService, {
    positionChanged$: of(({ left: 1, top: 1 })),
    visibilityChanged$: of(true),
  });
  const createComponent = createComponentFactory({
    component: GeometryConfirmButtonsComponent,
    imports: [
      SharedModule,
    ],
    providers: [
      { provide: GeometryConfirmService, useValue: geometryConfirmServiceMock }
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
