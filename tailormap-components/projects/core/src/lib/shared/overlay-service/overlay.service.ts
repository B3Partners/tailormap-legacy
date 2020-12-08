
import { Overlay, OverlayConfig, OverlayRef as CdkOverlayRef } from '@angular/cdk/overlay';
import {
  ComponentPortal,
} from '@angular/cdk/portal';
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

  constructor(
    private overlay: Overlay,
    private injector: Injector,
  ) {}

  public open<R = any, T = any>(
    content: TemplateRef<any> | Type<any>,
    data: T,
    config?: OverlayConfig,
  ): OverlayRef<R> {

    const configs = new OverlayConfig({
      width: '100%',
      height: '100%',
      hasBackdrop: false,
      ...config,
    });

    const overlay = this.overlay.create(configs);

    const overlayRef = new OverlayRef<R, T>(overlay, data);

    if (content instanceof TemplateRef) {
      this.createOverlayForTemplate(overlay, overlayRef, content);
      return overlayRef;
    }

    overlay.attach(new ComponentPortal(content, null, Injector.create({
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

  private createOverlayForTemplate(overlay: CdkOverlayRef, overlayRef: OverlayRef, content: TemplateRef<any>) {
    const containerPortal = new ComponentPortal(OverlayComponent, undefined, Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: OverlayRef,
          useValue: overlayRef,
        },
        {
          provide: TemplateRef,
          useValue: content,
        },
      ],
    }));
    overlay.attach<OverlayComponent>(containerPortal);
  }

}
