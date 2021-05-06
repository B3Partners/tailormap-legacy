/* tslint:disable */
/* eslint-disable */
import { Attribute } from './attribute';
import { Geometry } from './geometry';
import { Relation } from './relation';
export interface Feature {
  attributes?: Array<Attribute>;
  children?: Array<Feature>;
  clazz?: string;
  defaultGeometry?: Geometry;
  fid?: string;
  objecttype?: string;
  relations?: Array<Relation>;
}
