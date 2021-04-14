/* tslint:disable */
/* eslint-disable */
import { Pageable } from './pageable';
import { Plantenbak } from './plantenbak';
import { Sort } from './sort';
export interface PagePlantenbak {
  content?: Array<Plantenbak>;
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  pageable?: Pageable;
  size?: number;
  sort?: Sort;
  totalElements?: number;
  totalPages?: number;
}
