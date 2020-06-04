export * from './featureController.service';
import { FeatureControllerService } from './featureController.service';
export * from './wegvakonderdeelController.service';
import { WegvakonderdeelControllerService } from './wegvakonderdeelController.service';
export * from './wegvakonderdeelplanningController.service';
import { WegvakonderdeelplanningControllerService } from './wegvakonderdeelplanningController.service';
export const APIS = [FeatureControllerService, WegvakonderdeelControllerService, WegvakonderdeelplanningControllerService];
