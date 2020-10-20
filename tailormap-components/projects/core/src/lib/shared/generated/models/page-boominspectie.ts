/* tslint:disable */
import { Boominspectie } from './boominspectie';
import { Pageable } from './pageable';
import { Sort } from './sort';
export interface PageBoominspectie {
  content?: Array<Boominspectie>;
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
