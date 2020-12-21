import {
  AppLayer,
  GeoService,
} from '../../../../../bridge/typings';

export interface CreateUserLayerSuccessMessageModel {
  appLayerId: number;
  layerName: string;
  appLayer: AppLayer;
  service: GeoService;
}

export interface CreateUserLayerSuccessResponseModel {
  success: true;
  message: CreateUserLayerSuccessMessageModel;
}

export interface CreateUserLayerFailedResponseModel {
  success: false;
  error?: string;
  message?: string;
}

