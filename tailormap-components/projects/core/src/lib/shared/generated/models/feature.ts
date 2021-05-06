/* tslint:disable */
/* eslint-disable */
import { Attribute } from './attribute';
import { Geometry } from './geometry';
import { Relation } from './relation';
import { RelatedFeatureType } from '../../attribute-service/attribute-models';
export interface Feature {
  relatedFeatureTypes: RelatedFeatureType[];
  attributes?: Array<Attribute>;
  children?: Array<Feature>;
  clazz?: string;
  defaultGeometry?: Geometry;
  defaultGeometryField?: string;
  fid?: string;
  objecttype?: string;
  relations?: Array<Relation>;
}
