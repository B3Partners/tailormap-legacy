/* tslint:disable */
import { Boom } from './boom';
import { Boominspectie } from './boominspectie';
import { Boomplanning } from './boomplanning';
import { Rioolput } from './rioolput';
import { Weginspectie } from './weginspectie';
import { Wegvakonderdeel } from './wegvakonderdeel';
import { Wegvakonderdeelplanning } from './wegvakonderdeelplanning';
export interface Feature {
  children?: Array<Boom | Boominspectie | Boomplanning | Rioolput | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>;
  clazz?: string;
  objectGuid?: string;
  objecttype: string;
}
