/* tslint:disable */
import { Pageable } from './pageable';
import { Sort } from './sort';
import { Weginspectie } from './weginspectie';
export interface PageWeginspectie {
  content?: Array<Weginspectie>;
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
