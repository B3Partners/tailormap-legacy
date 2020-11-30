import { Subject } from 'rxjs';

import { OverlayRef as CdkOverlayRef } from '@angular/cdk/overlay';

import { TemplateRef, Type } from '@angular/core';

export interface OverlayCloseEvent<R> {
  type: 'backdropClick' | 'close';
  data: R;
}

// R = Response Data Type, T = Data passed to Modal Type
export class OverlayRef<R = any, T = any> {

  private afterClosedSubject$ = new Subject<OverlayCloseEvent<R>>();
  public afterClosed$ = this.afterClosedSubject$.asObservable();

  constructor(
    public overlay: CdkOverlayRef,
    public content: string | TemplateRef<any> | Type<any>,
    public data: T,
  ) {
    overlay.backdropClick().subscribe(() => this._close('backdropClick', null));
  }

  public close(data?: R) {
    this._close('close', data);
  }

  private _close(type: 'backdropClick' | 'close', data: R) {
    this.overlay.dispose();
    this.afterClosedSubject$.next({
      type,
      data,
    });
    this.afterClosedSubject$.complete();
  }
}
