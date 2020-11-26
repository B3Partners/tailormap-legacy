import { Extent } from '../../../../../bridge/typings';

export interface FeatureExtentParams {
  buffer: number;
  filter: string;
  appLayer: string;        // id
}

export interface FeatureExtentResponse {
  extent?: Extent;
  success?: boolean;
}
