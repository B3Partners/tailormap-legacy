export class BrowserFeatures {
  public static isTouchDevice = ('ontouchstart' in window);

  public static isMobile = !window.matchMedia('(min-device-width: 1200px)').matches;

  public static isHiDPI = window.devicePixelRatio > 1;
}
