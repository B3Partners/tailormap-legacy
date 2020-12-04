import {
  AppLayer,
  GeoServiceLayer,
} from '../../../../../bridge/typings';

export interface CreateUserLayerSuccessMessageModel {
  appLayerId: number;
  layerName: string;
  appLayer: AppLayer;
  serviceLayer: GeoServiceLayer;
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

