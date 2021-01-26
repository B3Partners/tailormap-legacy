
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
import { OverlayContent } from './overlay-content';

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
    content: TemplateRef<any> | Type<any> | string,
    data: T,
    config?: OverlayConfig,
    createRef?: (overlay: CdkOverlayRef, data: T) => OverlayRef,
  ): OverlayRef<R> {

    const configs = new OverlayConfig({
      width: '100%',
      height: '100%',
      hasBackdrop: false,
      ...config,
    });

    const overlay = this.overlay.create(configs);

    const overlayRef = createRef ? createRef(overlay, data) : new OverlayRef<R, T>(overlay, data);

    if (content instanceof TemplateRef || typeof content === 'string') {
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

  private createOverlayForTemplate(overlay: CdkOverlayRef, overlayRef: OverlayRef, content: TemplateRef<any> | string) {
    const containerPortal = new ComponentPortal(OverlayComponent, undefined, Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: OverlayRef,
          useValue: overlayRef,
        },
        {
          provide: OverlayContent,
          useValue: new OverlayContent(content),
        },
      ],
    }));
    overlay.attach<OverlayComponent>(containerPortal);
  }

}
