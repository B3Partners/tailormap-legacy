import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { GeometryConfirmService } from './geometry-confirm.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ScreenCoordinate } from '../models';

@Component({
  selector: 'tailormap-geometry-confirm-buttons',
  templateUrl: './geometry-confirm-buttons.component.html',
  styleUrls: ['./geometry-confirm-buttons.component.css'],
})
export class GeometryConfirmButtonsComponent implements OnInit, OnDestroy {

  private destroyed = new Subject();
  public position: ScreenCoordinate;
  public visible = false;

  constructor(private geometryConfirmService: GeometryConfirmService) {
    this.position = {
      left: 0,
      top: 0,
    };
    this.geometryConfirmService.positionChanged$
      .pipe(takeUntil(this.destroyed)).subscribe(value => {
      this.position = {
        left: value.left + 5,
        top: value.top - 50,
      };
    });

    this.geometryConfirmService.visibilityChanged$.pipe(takeUntil(this.destroyed)).subscribe(value => this.visible = value);

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
