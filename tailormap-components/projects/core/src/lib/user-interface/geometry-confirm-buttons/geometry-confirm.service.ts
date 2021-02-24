import {
  Injectable,
  OnDestroy,
} from '@angular/core';
import {
  Observable,
  Subject,
} from 'rxjs';
import {
  Coordinate,
  ScreenCoordinate,
} from '../models';
import { takeUntil } from 'rxjs/operators';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';

@Injectable({
  providedIn: 'root',
})
export class GeometryConfirmService implements OnDestroy {
  private destroyed = new Subject();

  private currentCoordinate: Coordinate;

  private positionSubject$ = new Subject<ScreenCoordinate>();
  public positionChanged$ = this.positionSubject$.asObservable();

  private visibilitySubject$ = new Subject<boolean>();
  public visibilityChanged$ = this.visibilitySubject$.asObservable();

  private closedSubject$ = new Subject<boolean>();
  private closedObservable$ = this.closedSubject$.asObservable();

  constructor(
    private tailorMapService: TailorMapService) {

    this.tailorMapService.extentChanged$.pipe(takeUntil(this.destroyed)).subscribe(event => {
      if (this.currentCoordinate) {
        const pixel = this.tailorMapService.getMapComponent().getMap()
          .coordinateToPixel(this.currentCoordinate.x, this.currentCoordinate.y);
        this.positionSubject$.next({
          left: pixel.x,
          top: pixel.y,
        });
      }
    });
  }

  public open$(coord: Coordinate): Observable<boolean> {
    this.currentCoordinate = coord;
    const pixel = this.tailorMapService.getMapComponent().getMap().coordinateToPixel(coord.x, coord.y);
    const pos: ScreenCoordinate = {
      left: pixel.x,
      top: pixel.y,
    };
    this.positionSubject$.next(pos);
    this.visibilitySubject$.next(true);
    return this.closedObservable$;
  }

  public hide(): void {
    this.visibilitySubject$.next(false);
  }

  public close(): void {
    this.closedSubject$.next(false);
  }

  public accept(): void {
    this.closedSubject$.next(true);
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
