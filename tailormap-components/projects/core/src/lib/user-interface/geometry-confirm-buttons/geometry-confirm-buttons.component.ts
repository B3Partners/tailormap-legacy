import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { GeometryConfirmService } from './geometry-confirm.service';
import {
  map,
} from 'rxjs/operators';
import {
  combineLatest,
  Observable,
  Subject,
} from 'rxjs';
import { ScreenCoordinate } from '../models';

@Component({
  selector: 'tailormap-geometry-confirm-buttons',
  templateUrl: './geometry-confirm-buttons.component.html',
  styleUrls: ['./geometry-confirm-buttons.component.css'],
})
export class GeometryConfirmButtonsComponent implements OnInit, OnDestroy {

  public readonly MARGIN = 5;
  public readonly BUTTON_HEIGHT = 50;
  private destroyed = new Subject();
  public position$: Observable<ScreenCoordinate>;
  public visible = false;

  constructor(private geometryConfirmService: GeometryConfirmService) {

    this.position$ = combineLatest(
      [this.geometryConfirmService.positionChanged$, this.geometryConfirmService.visibilityChanged$])
      .pipe(map(([position, visible]) => {
        return visible ? {left: position.left + this.MARGIN, top: position.top - this.BUTTON_HEIGHT} : null;
      }));
  }

  public accept(): void {
    this.geometryConfirmService.accept();
  }

  public cancel(): void {
    this.geometryConfirmService.close();
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
