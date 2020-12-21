import { Subject } from 'rxjs';

import { OverlayRef as CdkOverlayRef } from '@angular/cdk/overlay';

export interface OverlayCloseEvent<R> {
  type: 'backdropClick' | 'close';
  data: R;
}

// tslint:disable-next-line:no-empty-interface
export interface OverlayRefConfig {}

// R = Response Data Type, T = Data passed to Modal Type
export class OverlayRef<R = any, T = any> {

  protected afterClosedSubject$ = new Subject<OverlayCloseEvent<R>>();
  public afterClosed$ = this.afterClosedSubject$.asObservable();

  constructor(
    public overlay: CdkOverlayRef,
    public data: T,
    protected refConfig?: OverlayRefConfig,
  ) {
    overlay.backdropClick().subscribe(() => this._close('backdropClick', null));
  }

  public close(data?: R) {
    this._close('close', data);
  }

  protected _close(type: 'backdropClick' | 'close', data: R) {
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
