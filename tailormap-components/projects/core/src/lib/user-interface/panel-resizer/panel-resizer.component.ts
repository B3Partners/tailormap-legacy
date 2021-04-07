import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { finalize, map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tailormap-panel-resize',
  templateUrl: './panel-resizer.component.html',
  styleUrls: ['./panel-resizer.component.css'],
})
export class PanelResizerComponent implements OnInit {

  @ViewChild('resizer', { static: true })
  public resizer: ElementRef<HTMLDivElement>;

  @Input()
  public orientation: 'horizontal' | 'vertical' = 'vertical';

  @Output()
  public positionChanged: EventEmitter<number> = new EventEmitter<number>();

  private position: number;

  public resizing: boolean;

  constructor() {}

  public ngOnInit() {
    fromEvent(this.resizer.nativeElement.querySelector('.resize-handle'), 'mousedown')
      .pipe(
        map((event: MouseEvent) => this.orientation === 'horizontal' ? event.pageX : event.pageY),
        switchMap((initialPosition: number) => {
          this.startResize();
          return fromEvent(document, 'mousemove')
            .pipe(
              map((event: MouseEvent) => {
                if (this.orientation === 'horizontal') {
                  return event.pageX - initialPosition;
                }
                return event.pageY - initialPosition;
              }),
              takeUntil(fromEvent(document, 'mouseup')),
              finalize(() => this.resizeComplete()),
            );
        }),
      )
      .subscribe(result => {
        this.position = result;
        this.updateResizeIndicatorPosition(result);
      });
  }

  private startResize() {
    this.resizing = true;
    this.position = 0;
    document.body.classList.add('resize-active');
    this.updateResizeIndicatorPosition(0);
  }

  private resizeComplete() {
    document.body.classList.remove('resize-active');
    this.positionChanged.emit(this.position);
    this.resizing = false;
  }

  private updateResizeIndicatorPosition(position: number) {
    this.resizer.nativeElement.style.setProperty('--translate-pos', position + 'px');
  }

}
