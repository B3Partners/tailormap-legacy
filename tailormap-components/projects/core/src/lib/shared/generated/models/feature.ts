/* tslint:disable */
/* eslint-disable */
import { Field } from './field';
import { Relation } from './relation';
import { RelatedFeatureType } from '../../attribute-service/attribute-models';
export interface Feature {
  relatedFeatureTypes: RelatedFeatureType[];
  attributes?: Array<Field>;
  children?: Array<Feature>;
  clazz?: string;
  defaultGeometry?: string;
  defaultGeometryField?: string;
  fid?: string;
  objecttype?: string;
  relations?: Array<Relation>;
}
