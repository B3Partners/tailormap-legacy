import { Injectable } from '@angular/core';
import { ConnectionPositionPair, Overlay, OverlayConfig, PositionStrategy } from '@angular/cdk/overlay';
import { PopoverParams } from './models/popover-params.model';
import { PopoverRef } from './popover-ref';
import { PopoverPositionEnum } from './models/popover-position.enum';
import { OverlayService } from '../overlay-service/overlay.service';
import { OverlayRef } from '../overlay-service/overlay-ref';

/**
 * Service and component based on
 * https://netbasal.com/creating-powerful-components-with-angular-cdk-2cef53d81cea
 */

@Injectable({
  providedIn: 'root',
})
export class PopoverService {

  constructor(
    private overlayService: OverlayService,
    private overlay: Overlay,
  ) {}

  public open<R = any, T = any>(params: PopoverParams<T>): OverlayRef<R, T> {
    const overlayConfig = this.getOverlayConfig(
      params.width,
      params.height,
      params.hasBackdrop,
      this.getOverlayPosition(params.origin, params.position, params.positionOffset),
    );
    return this.overlayService.open(
      params.content,
      params.data,
      overlayConfig,
      (overlay) => {
        return new PopoverRef<R, T>(overlay, params.data, {
          origin: params.origin,
          closeOnClickOutside: params.closeOnClickOutside,
        });
      },
    );
  }

  private getOverlayConfig(width, height, hasBackdrop, positionStrategy: PositionStrategy): OverlayConfig {
    return new OverlayConfig({
      width,
      height,
      hasBackdrop,
      backdropClass: 'popover-backdrop',
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
  }

  private getOverlayPosition(origin: HTMLElement, position?: PopoverPositionEnum, positionOffset?: number): PositionStrategy {
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(origin)
      .withPositions(this.getPositions(position, positionOffset))
      .withPush(false);

    return positionStrategy;
  }

  private getPositions(position?: PopoverPositionEnum, positionOffset?: number): ConnectionPositionPair[] {
    if (position === PopoverPositionEnum.BOTTOM_RIGHT_DOWN) {
      return [
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
          offsetY: positionOffset || 0,
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom',
          offsetY: -1 * (positionOffset || 0),
        },
      ];
    }
    if (position === PopoverPositionEnum.BOTTOM_LEFT_DOWN) {
      return [
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: positionOffset || 0,
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetY: -1 * (positionOffset || 0),
        },
      ];
    }
    if (position === PopoverPositionEnum.TOP_RIGHT_UP) {
      return [
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom',
          offsetY: -1 * (positionOffset || 0),
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
          offsetY: positionOffset || 0,
        },
      ];
    }
    // PopoverPositionEnum.TOP_LEFT_UP is the default value
    return [
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetY: -1 * (positionOffset || 0),
      },
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
        offsetY: positionOffset || 0,
      },
    ];
  }

}
