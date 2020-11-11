/**
 * Manages the positioning and sizing of components on the page.
 *
 * Remarks: For now, very simple layout manager!!!!!!
 *          For now, only Dock.Bottom components are supported!!!!!!!
 *          For now, only one Dock.Bottom component is tested!!!!!!
 *
 * @@HostListener in Service - KAN NIET
 * @@https://stackoverflow.com/questions/39592972/is-it-possible-to-use-hostlistener-in-a-service-or-how-to-use-dom-events-in-an
 */

import { Injectable, OnDestroy } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PanelResizerComponent } from './panel-resizer/panel-resizer.component';
import { LayoutComponent } from './models';
import { Dock, WindowState } from './enums';

@Injectable({
  providedIn: 'root',
})
export class LayoutService implements OnDestroy {

  private screenWidth = 0;
  private screenHeight = 0;

  private components: LayoutComponent[] = [];

  // For window events.
  // private mouseOverResizeHandle = false;

  private isAlive = new Subject();

  constructor() {

    // Get screen width and heigth.
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    // console.log(`#LayoutService - ${this.screenWidth}x${this.screenHeight} px`);

    // Subscribe to the window resize event.
    fromEvent(window, 'resize')
      .pipe(takeUntil(this.isAlive))
      .subscribe((event) => this.onWindowResize(event));
  }

  public ngOnDestroy(): void {
    // Signal death.
    this.isAlive.next();   // Necessary?
    this.isAlive.complete();
  }

  private calcHeight(top: number): number {
    return this.screenHeight - top;
  }

  private calcTop(height: number): number {
    return this.screenHeight - height;
  }

  private calcTopOfComp(comp: LayoutComponent): number {
    return this.screenHeight - comp.layoutConfig.initialHeight;
  }

  public close(comp: LayoutComponent): void {
    // TODO: Update the docked components.
  }

  private getComponentByResizer(resizer: PanelResizerComponent): LayoutComponent {
    for (const comp of this.components) {
      // console.log(comp.layoutConfig);
      // console.log(comp.layoutConfig.panelResizer);
      if (comp.layoutConfig.panelResizer === resizer) {
        return comp;
      }
    }
    return null;
  }

  public maximize(comp: LayoutComponent): void {
    const config = comp.layoutConfig;
    if (config.windowState === WindowState.Maximized) {
      // Restore.
      config.componentRef.nativeElement.style.top = `${this.calcTopOfComp(comp)}px`;
      config.componentRef.nativeElement.style.height = `${config.initialHeight}px`;
      config.windowState = WindowState.Initial;
    } else {
      // Maximize.
      config.componentRef.nativeElement.style.top = `${0}px`;
      config.componentRef.nativeElement.style.height = `${this.calcHeight(0)}px`;
      config.windowState = WindowState.Maximized;
    }
  }

  public minimize(comp: LayoutComponent): void {
    const config = comp.layoutConfig;
    if (config.windowState === WindowState.Minimized) {
      // Restore.
      config.componentRef.nativeElement.style.top = `${this.calcTopOfComp(comp)}px`;
      config.componentRef.nativeElement.style.height = `${config.initialHeight}px`;
      config.windowState = WindowState.Initial;
    } else {
      // Get height of captionbar.
      const capHeight = comp.getCaptionbarHeight();
      const newTop = this.screenHeight - capHeight;
      config.componentRef.nativeElement.style.height = `${capHeight}px`;
      config.componentRef.nativeElement.style.top = `${newTop}px`;
      config.windowState = WindowState.Minimized;
    }
  }

  private onWindowResize(event): void {
    // Update the screen width and height.
    this.screenWidth = event.target.innerWidth;
    this.screenHeight = event.target.innerHeight;
    // this.screenWidth = window.innerWidth;
    // this.screenHeight = window.innerHeight;
    // TODO: Met update delay???
    this.updateComponents();
  }

  /**
   * Register a component/panel for being managed by the layout service.
   */
  public register(comp: LayoutComponent): void {
    this.components.push(comp);
    // TODO: DIT MET EEN DELAY????
    this.updateComponents();
  }

  public showResizer(comp: LayoutComponent, show: boolean): void {
    comp.layoutConfig.panelResizer.showHandle(show);
  }

  /**
   * Update component after resize.
   */
  public updateComponent(resizer: PanelResizerComponent, deltaY: number): void {
    // console.log('#LayoutService - updateComponent');

    const comp = this.getComponentByResizer(resizer);
    if (comp === null) {
      return;
    }
    // Get config.
    const config = comp.layoutConfig;
    // Get the current top.
    let top = parseInt(config.componentRef.nativeElement.style.top, 10);
    // Calculate top after resize.
    top += deltaY;

    // Calculate new height of component.
    let newHeight = this.calcHeight(top);

    // Get height of captionbar.
    const capHeight = comp.getCaptionbarHeight();
    // Check new height.
    if (newHeight < capHeight) {
      newHeight = capHeight;
      // Recalculate top.
      top = this.calcTop(newHeight);
    }

    // Update component initial height.
    config.initialHeight = newHeight;
    // Update component height and position.
    config.componentRef.nativeElement.style.top = `${top}px`;
    config.componentRef.nativeElement.style.height = `${newHeight}px`;
  }

  public updateComponents(): void {
    // console.log('#LayoutService - update');

    const topObjects: LayoutComponent[] = [];
    const botObjects: LayoutComponent[] = [];

    // Split/order.
    for (const comp of this.components) {
      if (comp.layoutConfig.dock === Dock.Top) {
        topObjects.push(comp);
      } else if (comp.layoutConfig.dock === Dock.Bottom) {
        botObjects.push(comp);
      } else {
        topObjects.push(comp);
      }
    }

    // Merge.
    const allComponents = [...topObjects, ...botObjects.reverse()];

    // Calculate width and height.
    for (const comp of allComponents) {

      const domElem = comp.layoutConfig.componentRef.nativeElement;

      // WIDTH
      const widthPx = `${this.screenWidth}px`;
      domElem.style.width = widthPx;

      // HEIGHT
      const heightPx = `${comp.layoutConfig.initialHeight}px`;
      domElem.style.height = heightPx;

      // LEFT
      const leftPx = `${0}px`;
      domElem.style.left = leftPx;

      // TOP
      let top = this.calcTopOfComp(comp);

      // DEBUG
      // top = top - 50;

      if (top < 0) { top = 0; }
      const topPx = `${top}px`;
      domElem.style.top = topPx;
    }
  }
}
