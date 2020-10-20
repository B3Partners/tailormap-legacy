/* tslint:disable */
import { Boomplanning } from './boomplanning';
import { Pageable } from './pageable';
import { Sort } from './sort';
export interface PageBoomplanning {
  content?: Array<Boomplanning>;
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
