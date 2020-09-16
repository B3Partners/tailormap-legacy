/**============================================================================
 * Manages the positioning and sizing of components on the page.
 *
 * Remarks: For now, very simple layout manager!!!!!!
 *          For now, only Dock.Bottom components are supported!!!!!!!
 *          For now, only one Dock.Bottom component is tested!!!!!!
 *
 * @@HostListener in Service - KAN NIET
 * @@https://stackoverflow.com/questions/39592972/is-it-possible-to-use-hostlistener-in-a-service-or-how-to-use-dom-events-in-an
 *===========================================================================*/

import { Injectable, ElementRef, OnDestroy } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PanelResizerComponent} from './panel-resizer.component';

/**----------------------------------------------------------------------------
 * Defines the mandatory properties of a panel managed by this layout service.
 */
export interface ILayoutComponent {
  canResize: boolean;
  componentRef: ElementRef;
  dock: Dock;
  initialHeight: number;
  panelResizer: PanelResizerComponent;
  windowState: WindowState;
  getCaptionbarHeight(): number;
}

/**----------------------------------------------------------------------------
 */
export enum Dock {
  Top,
  Bottom,
  Fill
}

/**----------------------------------------------------------------------------
 */
export enum WindowState {
  Maximized,
  Minimized,
  Initial,
  Closed = 3
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService implements OnDestroy {

  screenWidth = 0;
  screenHeight = 0;

  components: ILayoutComponent[] = [];

  // For window events.
  mouseOverResizeHandle = false;

  isAlive = new Subject();

  /**----------------------------------------------------------------------------
   */
  constructor() {

    // Get screen width and heigth.
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    console.log(`#LayoutService - ${this.screenWidth}x${this.screenHeight} px`);

    // Subscribe to the window resize event.
    fromEvent(window, 'resize')
      .pipe(takeUntil(this.isAlive))
      .subscribe((event) => this.onWindowResize(event));
  }
  /**----------------------------------------------------------------------------
   */
  ngOnDestroy(): void {
    // Signal death.
    this.isAlive.next();   // Necessary?
    this.isAlive.complete();
  }
  /**----------------------------------------------------------------------------
   */
  calcHeight(top: number): number {
    return this.screenHeight - top;
  }
  /**----------------------------------------------------------------------------
   */
  calcTop(height: number): number {
    return this.screenHeight - height;
  }
  /**----------------------------------------------------------------------------
   */
  calcTopOfComp(comp: ILayoutComponent): number {
    return this.screenHeight - comp.initialHeight;
  }
  /**----------------------------------------------------------------------------
   */
  close(comp: ILayoutComponent): void {
    // TODO: Update the docked components.
  }
  /**----------------------------------------------------------------------------
   */
  getComponentByResizer(resizer: PanelResizerComponent): ILayoutComponent {
    for (const comp of this.components) {
      if (comp.panelResizer === resizer) {
        return comp;
      }
    }
    return null;
  }
  /**----------------------------------------------------------------------------
   */
  maximize(comp: ILayoutComponent): void {
    if (comp.windowState === WindowState.Maximized) {
      // Restore.
      comp.componentRef.nativeElement.style.top = `${this.calcTopOfComp(comp)}px`;
      comp.componentRef.nativeElement.style.height = `${comp.initialHeight}px`;
      comp.windowState = WindowState.Initial;
    } else {
      // Maximize.
      comp.componentRef.nativeElement.style.top = `${0}px`;
      comp.componentRef.nativeElement.style.height = `${this.calcHeight(0)}px`;
      comp.windowState = WindowState.Maximized;
    }
  }
  /**----------------------------------------------------------------------------
   */
  minimize(comp: ILayoutComponent): void {
    if (comp.windowState === WindowState.Minimized) {
      // Restore.
      comp.componentRef.nativeElement.style.top = `${this.calcTopOfComp(comp)}px`;
      comp.componentRef.nativeElement.style.height = `${comp.initialHeight}px`;
      comp.windowState = WindowState.Initial;
    } else {
      // Get height of captionbar.
      const capHeight = comp.getCaptionbarHeight();
      const newTop = this.screenHeight - capHeight;
      comp.componentRef.nativeElement.style.height = `${capHeight}px`;
      comp.componentRef.nativeElement.style.top = `${newTop}px`;
      comp.windowState = WindowState.Minimized;
    }
  }
  /**----------------------------------------------------------------------------
   */
  onWindowResize(event): void {
    // Update the screen width and height.
    this.screenWidth = event.target.innerWidth;
    this.screenHeight = event.target.innerHeight;
    // this.screenWidth = window.innerWidth;
    // this.screenHeight = window.innerHeight;
    // TODO: Met update delay???
    this.updateComponents();
  }
  /**----------------------------------------------------------------------------
   * Register a component/panel for being managed by the layout service.
   */
  register(comp: ILayoutComponent): void {
    this.components.push(comp);
    // TODO: DIT MET EEN DELAY????
    this.updateComponents();
  }
  /**----------------------------------------------------------------------------
   */
  showResizer(comp: ILayoutComponent, show: boolean): void {
    comp.panelResizer.showHandle(show);
  }
  /**----------------------------------------------------------------------------
   * Update component after resize.
   */
  updateComponent(resizer: PanelResizerComponent, deltaY: number): void {
    //console.log("#LayoutService - updateComponent");
    const comp = this.getComponentByResizer(resizer);
    if (comp === null) {
      return;
    }
    // Get the current top.
    let top = parseInt(comp.componentRef.nativeElement.style.top, 10);
    // Calculate top after resize.
    top += deltaY;

    // Calculate new height of component.
    let newHeight = this.calcHeight(top);

    // Get height of captionbar.
    const capHeight = comp.getCaptionbarHeight();
    // Check new height.
    if (newHeight<capHeight) {
      newHeight = capHeight;
      // Recalculate top.
      top = this.calcTop(newHeight);
    }

    // Update component initial height.
    comp.initialHeight = newHeight;
    // Update component height and position.
    comp.componentRef.nativeElement.style.top = `${top}px`;
    comp.componentRef.nativeElement.style.height = `${newHeight}px`;
  }
  /**----------------------------------------------------------------------------
   */
  updateComponents(): void {
    //console.log("#LayoutService - update");

    const topObjects: ILayoutComponent[] = [];
    const botObjects: ILayoutComponent[] = [];

    // Split/order.
    for (const comp of this.components) {
      if (comp.dock === Dock.Top) {
        topObjects.push(comp);
      } else if (comp.dock === Dock.Bottom) {
        botObjects.push(comp);
      } else {
        topObjects.push(comp);
      }
    }

    // Merge.
    const allComponents = [...topObjects, ...botObjects.reverse()];

    // Calculate width and height.
    for (const comp of this.components) {

      const domElem = comp.componentRef.nativeElement;

      // WIDTH
      const widthPx = `${this.screenWidth}px`;
      domElem.style.width = widthPx;

      // HEIGHT
      const heightPx = `${comp.initialHeight}px`;
      domElem.style.height = heightPx;

      // LEFT
      const leftPx = `${0}px`;
      domElem.style.left = leftPx;

      // TOP
      let top = this.calcTopOfComp(comp);
      if (top < 0) { top = 0; }
      const topPx = `${top}px`;
      domElem.style.top = topPx;
    }
  }
}
