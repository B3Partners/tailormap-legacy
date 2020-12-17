import { Injectable } from '@angular/core';
import {
  Observable,
  Subject,
} from 'rxjs';
import { ConfirmGeometry } from '../models';

@Injectable({
  providedIn: 'root',
})
export class GeometryConfirmService {

  private positionSubject$ = new Subject<ConfirmGeometry>();
  public positionChanged$ = this.positionSubject$.asObservable();

  private visibilitySubject$ = new Subject<boolean>();
  public visibilityChanged$ = this.visibilitySubject$.asObservable();

  private closedSubject$ = new Subject<boolean>();
  private closedObservable$ = this.closedSubject$.asObservable();

  constructor() {
  }

  public open(pos: ConfirmGeometry): Observable<boolean> {
    this.positionSubject$.next(pos);
    return this.closedObservable$;
  }

  public hide() {
    this.visibilitySubject$.next(false);
  }

  public close(): void {
    this.closedSubject$.next(false);
  }

  public accept(): void {
    this.closedSubject$.next(true);
  }
}
