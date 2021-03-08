import { OverlayService } from './overlay.service';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { Overlay } from '@angular/cdk/overlay';
import { Injector } from '@angular/core';


describe('OverlayService', () => {
  let spectator: SpectatorService<OverlayService>;
  const createService = createServiceFactory({
    service: OverlayService,
    providers: [
      Overlay,
      Injector,
    ],
  });

  beforeEach(() => spectator = createService());

  it('should be created', () => {
    expect(spectator).toBeTruthy();
  });
});
