import { AbstractControl } from '@angular/forms';

const rgbRegex = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/i;
const shorthandHexRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
const defaultRgb = { r: 30, b: 30, g: 30 }; // @TODO: Select default color?

export const getRgbForColor = (color: string): { r: number, g: number, b: number } => {
  if (!color) {
    return defaultRgb;
  }
  const rgbResult = rgbRegex.exec(color);
  if (rgbResult !== null) {
    return { r: parseInt(rgbResult[1], 10), g: parseInt(rgbResult[2], 10), b: parseInt(rgbResult[3], 10) };
  }
  color = color.replace(shorthandHexRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });
  const hexResult = hexRegex.exec(color);
  if (hexResult !== null) {
    return {
      r: parseInt(hexResult[1], 16),
      g: parseInt(hexResult[2], 16),
      b: parseInt(hexResult[3], 16),
    };
  }
  return defaultRgb;
}

export const getRgbStyleForColor = (color: string): string => {
  const rgb = getRgbForColor(color);
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export const isValidColor = (color: string, allowEmpty?: boolean): boolean => {
  if (allowEmpty && isValidEmptyColor(color)) {
    return true;
  }
  return rgbRegex.test(color) || shorthandHexRegex.test(color) || hexRegex.test(color);
}

export const isValidEmptyColor = (color: string | undefined) => {
  return (typeof color === 'undefined' || color === '' || color === 'transparent' );
}

export const colorValidator = (allowEmpty?: boolean) => (control: AbstractControl) => {
  if (allowEmpty && isValidEmptyColor(control.value)) {
    return null;
  }
  return !isValidColor('' + control.value, allowEmpty)
    ? { invalidColor: { message: 'Dit is een ongeldige kleur. Alleen hexadecimale kleuren of rgb codes zijn toegestaan' } }
    : null;
};

const componentToHex = (c: number) => {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

export const rgbToHex = (color: string) => {
  const rgbResult = rgbRegex.exec(color);
  if (rgbResult !== null) {
    return [
      '#',
      componentToHex(parseInt(rgbResult[1], 10)),
      componentToHex(parseInt(rgbResult[2], 10)),
      componentToHex(parseInt(rgbResult[3], 10)),
    ].join('');
  }
  return '';
}
