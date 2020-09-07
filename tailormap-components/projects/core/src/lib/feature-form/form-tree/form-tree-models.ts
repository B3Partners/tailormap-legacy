import { Feature } from '../../shared/generated';


export interface FeatureNode {
  name: string;
  children?: FeatureNode[];
  objectGuid: string;
  feature?: Feature;
  isFeatureType: boolean;
  selected: boolean;
}

/** Flat node with expandable and level information */
export interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  feature?: Feature;
  isFeatureType: boolean;
  selected: boolean;
}
