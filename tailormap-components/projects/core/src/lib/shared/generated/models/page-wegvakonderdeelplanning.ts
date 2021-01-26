/* tslint:disable */
import { Pageable } from './pageable';
import { Sort } from './sort';
import { Wegvakonderdeelplanning } from './wegvakonderdeelplanning';
export interface PageWegvakonderdeelplanning {
  content?: Array<Wegvakonderdeelplanning>;
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
