import { By } from '@angular/platform-browser';
import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';

export const queryByClass = (fixture: ComponentFixture<any>, cssSelector: string) => {
  return fixture.debugElement.query(By.css(cssSelector));
}

export const queryAllByClass = (fixture: ComponentFixture<any>, cssSelector: string) => {
  return fixture.debugElement.queryAll(By.css(cssSelector));
}

export const assertCssQueries = (debugEl: DebugElement, queries: { [q: string]: boolean }) => {
  Object.keys(queries).forEach(q => {
    const el = debugEl.query(By.css(q));
    if (queries[q]) {
      // @ts-ignore
      expect(el).not.toBeNull(`Expected ${q} to exist, but it does not exist`);
    } else {
      // @ts-ignore
      expect(el).toBeNull(`Expected ${q} to not exist, but it does exist`);
    }
  });
}

export const queryTextContent = (fixture: ComponentFixture<any>, cssSelector: string): string => {
  const el = fixture.debugElement.query(By.css(cssSelector));
  if (el && el.nativeElement) {
    return (el.nativeElement as Element).textContent;
  }
  return null;
}
