/* tslint:disable */
import { Pageable } from './pageable';
import { Sort } from './sort';
import { Wegvakonderdeel } from './wegvakonderdeel';
export interface PageWegvakonderdeel {
  content?: Array<Wegvakonderdeel>;
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
