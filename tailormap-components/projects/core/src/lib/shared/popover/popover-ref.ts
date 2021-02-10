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

  private readonly clickOutsideListener: () => void;
  private readonly clickInsideListener: () => void;

  constructor(
    public overlay: CdkOverlayRef,
    public data: T,
    protected refConfig?: PopoverRefConfig,
  ) {
    super(overlay, data, refConfig);

    this.clickInsideListener = this.listenToClickInside.bind(this);
    this.clickOutsideListener = this.listenToClickOutside.bind(this);

    if (refConfig && refConfig.closeOnClickOutside && this.overlay) {
        window.setTimeout(() => {
          document.addEventListener('click', this.clickOutsideListener);
          this.overlay.overlayElement.addEventListener('click', this.clickInsideListener);
        }, 0);
    }
  }

  public listenToClickInside(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  public listenToClickOutside() {
    this._close('backdropClick', this.data);
  }

  protected destroy() {
    if (this.overlay && this.overlay.overlayElement) {
      this.overlay.overlayElement.removeEventListener('click', this.clickInsideListener);
    }
    super.destroy();
    document.removeEventListener('click', this.clickOutsideListener);
  }

}
