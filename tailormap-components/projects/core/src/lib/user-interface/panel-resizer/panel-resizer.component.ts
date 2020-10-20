/**
 * Shows a resize 'handle' on top of a panel.
 *
 * https://stackoverflow.com/questions/36273791/how-to-implement-a-draggable-div-in-angular-2-using-rx
 */

import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'tailormap-panel-resize',
  templateUrl: './panel-resizer.component.html',
  styleUrls: ['./panel-resizer.component.css'],
})
export class PanelResizerComponent implements OnInit, AfterViewInit {

  // mouseup = new EventEmitter<MouseEvent>();
  // mousedown = new EventEmitter<MouseEvent>();
  // mousemove = new EventEmitter<MouseEvent>();
  // mousedrag: Observable<{top, left}>;

  public visible = false;

  private dragStartY = 0;

  private isMouseDown = false;

  constructor(private layoutService: LayoutService) {
  }

  public ngOnInit(): void {
  }

  public ngAfterViewInit(): void {
    // console.log('#Resizer - ngAfterViewInit');
    // Hide handle at startup.
    this.showHandle(false);
  }

  public onPanelMouseEnter(): void {
    // console.log('#Resizer - onMouseEnter');
    this.showHandle(true);
  }

  public onPanelMouseLeave(): void {
    // console.log('#Resizer - onMouseLeave');
    if (!this.isMouseDown) {
      this.showHandle(false);
    }
  }

  public onHandleMouseDown(event: MouseEvent): void {
    // console.log('#Resizer - onHandleMouseDown');
    this.isMouseDown = true;
    this.dragStartY = event.screenY;
  }

  @HostListener('window:mousemove', ['$event'])
  // @ts-ignore
  private onWindowMouseMove(event: MouseEvent): void {
    if (this.isMouseDown) {
      const deltaY = event.screenY - this.dragStartY;
      this.layoutService.updateComponent(this, deltaY);
      this.dragStartY += deltaY;
    }
  }

  @HostListener('window:mouseup', ['$event'])
  // @ts-ignore
  private onWindowMouseUp(event: MouseEvent): void {
    this.isMouseDown = false;
  }

  public showHandle(show: boolean): void {
    this.visible = show;
  }
}
