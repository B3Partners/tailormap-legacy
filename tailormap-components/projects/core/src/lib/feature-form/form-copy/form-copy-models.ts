import { Feature } from '../../shared/generated';

export interface CopyDialogData {
  originalFeature: Feature
  destinationFeatures: Feature[];
}
