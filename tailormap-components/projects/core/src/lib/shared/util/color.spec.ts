import { getRgbForColor } from './color';

describe('test color util', () => {

  it('should convert hash-based color to RGB', () => {
    const color = '#000000';
    const rgb = getRgbForColor(color);
    expect(rgb).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('should convert short hash-based color to RGB', () => {
    const color = '#333';
    const rgb = getRgbForColor(color);
    expect(rgb).toEqual({ r: 51, g: 51, b: 51 });
  });

  it('should convert rgb based color to RGB', () => {
    const color = 'rgb(255, 255, 50)';
    const rgb = getRgbForColor(color);
    expect(rgb).toEqual({ r: 255, g: 255, b: 50 });
  });

  it('should revert to default color for invalid color', () => {
    const color = 'no-color';
    const rgb = getRgbForColor(color);
    expect(rgb).toEqual({ r: 30, g: 30, b: 30 });
  });

});
