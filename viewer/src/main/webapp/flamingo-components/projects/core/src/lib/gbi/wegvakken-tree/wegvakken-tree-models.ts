import { Feature } from '../../shared/wegvakken-models';

export interface FeatureNode {
  name: string;
  children?: FeatureNode[];
  id: string;
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
