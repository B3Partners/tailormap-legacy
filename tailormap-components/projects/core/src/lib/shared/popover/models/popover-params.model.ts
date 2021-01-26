import { PopoverContent } from './popover-content.model';
import { PopoverPositionEnum } from './popover-position.enum';

export interface PopoverParams<T> {
  origin: HTMLElement;
  content: PopoverContent;
  data?: T;
  width?: string | number;
  height: string | number;
  closeOnClickOutside?: boolean;
  hasBackdrop?: boolean;
  position?: PopoverPositionEnum;
}
