import { Feature } from '../../shared/generated';

export interface FeatureNode {
  name: string;
  children?: FeatureNode[];
  objectGuid: string;
  feature?: Feature;
  isFeatureType: boolean;
  selected: boolean;
}

export interface FormTreeMetadata {
  feature?: Feature;
  isFeatureType: boolean;
  fid?: string;
}
