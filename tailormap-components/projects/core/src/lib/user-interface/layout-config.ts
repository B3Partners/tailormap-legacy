
import { ElementRef } from '@angular/core';
import { PanelResizerComponent } from './panel-resizer/panel-resizer.component';
import { Dock, WindowState } from './enums';

/**
 * Defines the mandatory properties of a panel managed by the layout service.
 */
export class LayoutConfig {

  public canResize: boolean;
  public componentRef: ElementRef;
  public dock: Dock;
  public initialHeight: number;
  public panelResizer: PanelResizerComponent;
  public windowState: WindowState;

  constructor(componentRef: ElementRef, panelResizer: PanelResizerComponent) {
    this.canResize = true;
    this.componentRef = componentRef;
    this.dock = Dock.Bottom;
    this.initialHeight = 200;
    this.panelResizer = panelResizer;
    this.windowState = WindowState.Initial;
  }
}
