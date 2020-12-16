import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { GeometryConfirmService } from './geometry-confirm.service';
import { ConfirmGeometry } from '../../models';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'tailormap-geometry-confirm-buttons',
  templateUrl: './geometry-confirm-buttons.component.html',
  styleUrls: ['./geometry-confirm-buttons.component.css'],
})
export class GeometryConfirmButtonsComponent implements OnInit, OnDestroy {

  private destroyed = new Subject();
  public position: ConfirmGeometry;
  public visible = false;

  constructor(private geometryConfirmService: GeometryConfirmService) {
    this.position = {
      left: 500,
      top: 600,
    };
    this.geometryConfirmService.positionChanged$
      .pipe(takeUntil(this.destroyed)).subscribe(value => {
      this.visible = true;
      this.position = value;
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
