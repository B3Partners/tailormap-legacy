/**============================================================================
 * Shows a resize "handle" on top of a panel.
 *
 * https://stackoverflow.com/questions/36273791/how-to-implement-a-draggable-div-in-angular-2-using-rx
 *===========================================================================*/

import {Component, OnInit, HostListener,
        ViewChild, AfterViewInit} from '@angular/core';

import { LayoutService } from './layout.service';

@Component({
  selector: 'tailormap-panel-resize',
  templateUrl: './panel-resizer.component.html',
  styleUrls: ['./panel-resizer.component.css']
})
export class PanelResizerComponent implements OnInit, AfterViewInit {

  // mouseup = new EventEmitter<MouseEvent>();
  // mousedown = new EventEmitter<MouseEvent>();
  // mousemove = new EventEmitter<MouseEvent>();
  // mousedrag: Observable<{top, left}>;

  // The drag handle.
  @ViewChild("resizehandle") handle;

  dragStartY = 0;

  isMouseDown = false;

  /**----------------------------------------------------------------------------
   */
  constructor(private layoutService: LayoutService) {
  }
  /**----------------------------------------------------------------------------
   */
  ngOnInit(): void {
  }
  /**----------------------------------------------------------------------------
   */
  ngAfterViewInit(): void {
    //console.log("#Resizer - ngAfterViewInit");
    // Hide handle at startup.
    this.showHandle(false);
  }
  /**----------------------------------------------------------------------------
   */
  onPanelMouseEnter(): void {
    //console.log("#Resizer - onMouseEnter");
    this.showHandle(true);
  }
  /**----------------------------------------------------------------------------
   */
  onPanelMouseLeave(): void {
    //console.log("#Resizer - onMouseLeave");
    if (!this.isMouseDown) {
      this.showHandle(false);
    }
  }
  /**----------------------------------------------------------------------------
   */
  onHandleMouseDown(event: MouseEvent): void {
    //console.log("#Resizer - onHandleMouseDown");
    this.isMouseDown = true;
    this.dragStartY = event.screenY;
  }
  /**----------------------------------------------------------------------------
   */
  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent): void {
    if (this.isMouseDown) {
      const deltaY = event.screenY - this.dragStartY;
      this.layoutService.updateComponent(this, deltaY);
      this.dragStartY += deltaY;
    }
  }
  /**----------------------------------------------------------------------------
   */
  @HostListener('window:mouseup', ['$event'])
  onWindowMouseUp(event: MouseEvent): void {
    this.isMouseDown = false;
  }
  /**----------------------------------------------------------------------------
   */
  showHandle(show: boolean): void {
    if (show) {
      this.handle.nativeElement.style.display = "flex";
      this.handle.nativeElement.style.cursor = "ns-resize";
    } else {
      this.handle.nativeElement.style.display = "none";
      this.handle.nativeElement.style.cursor = "auto";
    }
  }
}
