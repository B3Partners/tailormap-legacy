import { Component, HostListener, AfterViewInit } from '@angular/core';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'tailormap-panel-resize',
  templateUrl: './panel-resizer.component.html',
  styleUrls: ['./panel-resizer.component.css'],
})
export class PanelResizerComponent {

  public visible = true;
  private dragStartY = 0;
  private isMouseDown = false;

  constructor(
    private layoutService: LayoutService,
  ) {}

  public onHandleMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.dragStartY = event.screenY;
  }

  @HostListener('window:mousemove', ['$event'])
  public onWindowMouseMove(event: MouseEvent): void {
    if (this.isMouseDown) {
      const deltaY = event.screenY - this.dragStartY;
      this.layoutService.updateComponent(this, deltaY);
      this.dragStartY += deltaY;
    }
  }

  @HostListener('window:mouseup', ['$event'])
  public onWindowMouseUp(event: MouseEvent): void {
    this.isMouseDown = false;
  }

  public showHandle(show: boolean): void {
    this.visible = show;
  }

}
