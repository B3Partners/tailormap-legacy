import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuButtonComponent } from './menu-button.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../../../shared/shared.module';

describe('MenuButtonComponent', () => {
  let spectator: Spectator<MenuButtonComponent>;
  const createComponent = createComponentFactory({
    component: MenuButtonComponent,
    imports: [ SharedModule ],
  })
  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
