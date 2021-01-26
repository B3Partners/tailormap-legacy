/* tslint:disable */
import { Domeinwaarde } from './domeinwaarde';
export interface Domein {
  id?: number;
  leeg_toestaan?: boolean;
  linkedDomains?: Array<Domein>;
  naam?: string;
  parent?: Domein;
  waardes?: Array<Domeinwaarde>;
}
