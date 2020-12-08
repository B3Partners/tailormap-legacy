import {
  AppLayer,
  Level,
} from '../../../../../bridge/typings';

export class ApplicationTreeHelper {

  public static isLevel(item: AppLayer | Level): item is Level {
    return !ApplicationTreeHelper.isAppLayer(item);
  }

  public static isAppLayer(item: AppLayer | Level): item is AppLayer {
    return typeof (item as AppLayer).layerName !== 'undefined';
  }

}
