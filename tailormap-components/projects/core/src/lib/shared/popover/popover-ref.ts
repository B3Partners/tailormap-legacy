import { fromEvent, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { OverlayRef as CdkOverlayRef } from '@angular/cdk/overlay/overlay-ref';
import {
  OverlayRef,
  OverlayRefConfig,
} from '../overlay-service/overlay-ref';

interface PopoverRefConfig extends OverlayRefConfig {
  origin: HTMLElement;
  closeOnClickOutside?: boolean;
}

export class PopoverRef<R = any, T = any> extends OverlayRef {

  private eventSubscription: Subscription;

  constructor(
    public overlay: CdkOverlayRef,
    public data: T,
    protected refConfig?: PopoverRefConfig,
  ) {
    super(overlay, data, refConfig);

    if (refConfig && refConfig.closeOnClickOutside) {
        window.setTimeout(() => {
        this.listenToClickOutside();
      }, 0);
    }
  }

  public listenToClickOutside() {
    this.eventSubscription = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(event => {
          const clickTarget = event.target as HTMLElement;
          return clickTarget !== this.refConfig.origin &&
            (!!this.overlay && !this.overlay.overlayElement.contains(clickTarget));
        }),
        take(1),
      )
      .subscribe(() => {
        this._close('backdropClick', this.data);
      });
  }

  protected destroy() {
    super.destroy();
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

}
