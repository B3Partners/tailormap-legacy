import { Subject } from 'rxjs';

import { OverlayRef as CdkOverlayRef } from '@angular/cdk/overlay';

export interface OverlayCloseEvent<R> {
  type: 'backdropClick' | 'close';
  data: R;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OverlayRefConfig {}

// R = Response Data Type, T = Data passed to Modal Type
export class OverlayRef<R = any, T = any> {

  protected afterClosedSubject$ = new Subject<OverlayCloseEvent<R>>();
  public afterClosed$ = this.afterClosedSubject$.asObservable();

  public isOpen: boolean;

  constructor(
    public overlay: CdkOverlayRef,
    public data: T,
    protected refConfig?: OverlayRefConfig,
  ) {
    this.isOpen = true;
    overlay.backdropClick().subscribe(() => this._close('backdropClick', null));
  }

  public close(data?: R) {
    if (!this.isOpen) {
      return;
    }
    this._close('close', data);
  }

  protected _close(type: 'backdropClick' | 'close', data: R) {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.destroy();
    this.overlay.dispose();
    this.afterClosedSubject$.next({
      type,
      data,
    });
    this.afterClosedSubject$.complete();
  }

  protected destroy() {}

}
