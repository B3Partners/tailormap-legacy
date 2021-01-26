import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

const ua = window && window.navigator ? window.navigator.userAgent : '';
const isIE = /MSIE|Trident/.test(ua);

type EventConstructor<T extends Event> = new (...args: any[]) => T;

export const createEvent = <T extends Event, I extends EventInit = {}>(
  eventConstructor: EventConstructor<T>,
  eventName: string,
  eventType: string,
  evtData?: I,
): T => {
  if (isIE) {
    const evt = document.createEvent(eventName);
    evt.initEvent(eventType, true, true);
    if (evtData) {
      for (const key in evtData) {
        if (evtData.hasOwnProperty(key)) {
          // @ts-ignore
          evt['test' + key] = evtData[key];
        }
      }
    }
    return evt as T;
  } else {
    return new eventConstructor(eventType, evtData);
  }
};

export const triggerInputEvent = (debugElement: DebugElement, cssSelector: string, value: string) => {
  const inputField = debugElement.query(By.css(cssSelector)).nativeElement;
  if (!inputField) {
    return;
  }
  inputField.value = value;
  inputField.dispatchEvent(createEvent<KeyboardEvent>(KeyboardEvent, 'KeyboardEvent', 'input'));
};
