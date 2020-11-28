
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  Injectable,
  InjectionToken,
  Injector,
  TemplateRef,
  Type,
} from '@angular/core';
import { OverlayRef } from './overlay-ref';
import { OverlayComponent } from './overlay/overlay.component';

export const OVERLAY_DATA = new InjectionToken<any>('OverlayData');

@Injectable({
  providedIn: 'root',
})
export class OverlayService {
  constructor(private overlay: Overlay, private injector: Injector) {}

  public open<R = any, T = any>(
    content: string | TemplateRef<any> | Type<any>,
    data: T,
    config?: OverlayConfig,
  ): OverlayRef<R> {

    const configs = new OverlayConfig({
      width: '100%',
      height: '100%',
      ...config,
    });

    const overlay = this.overlay.create(configs);

    const overlayRef = new OverlayRef<R, T>(overlay, content, data);

    overlay.attach(new ComponentPortal(OverlayComponent, null, Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: OverlayRef,
          useValue: overlayRef,
        },
        {
          provide: OVERLAY_DATA,
          useValue: data,
        },
      ],
    })));

    return overlayRef;
  }

}
