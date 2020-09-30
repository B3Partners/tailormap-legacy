
import { LayoutConfig } from './layout-config';

// import { ElementRef } from '@angular/core';
// import { PanelResizerComponent } from './panel-resizer/panel-resizer.component';
// import { Dock, WindowState } from './enums';

// /**
//  * Defines the mandatory properties of a panel managed by the layout service.
//  */
// export interface LayoutConfig {
//   canResize: boolean;
//   componentRef: ElementRef;
//   dock: Dock;
//   initialHeight: number;
//   panelResizer: PanelResizerComponent;
//   windowState: WindowState;
// }

/**
 * Defines the mandatory properties of a panel managed by the layout service.
 */
export interface LayoutComponent {
    layoutConfig: LayoutConfig;
    getCaptionbarHeight(): number;
}

// export interface LayoutComponent {
//     canResize: boolean;
//     componentRef: ElementRef;
//     dock: Dock;
//     initialHeight: number;
//     panelResizer: PanelResizerComponent;
//     windowState: WindowState;
//     getCaptionbarHeight(): number;
// }
