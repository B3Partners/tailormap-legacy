/* tslint:disable */
import { Boom } from './boom';
import { Boominspectie } from './boominspectie';
import { Boomplanning } from './boomplanning';
import { CultBeplanting } from './cult-beplanting';
import { Gras } from './gras';
import { Haag } from './haag';
import { MechLeiding } from './mech-leiding';
import { NatBeplanting } from './nat-beplanting';
import { Rioolput } from './rioolput';
import { VrijvLeiding } from './vrijv-leiding';
import { Weginspectie } from './weginspectie';
import { Wegvakonderdeel } from './wegvakonderdeel';
import { Wegvakonderdeelplanning } from './wegvakonderdeelplanning';
export interface Feature {
  children?: Array<Boom | Boominspectie | Boomplanning | CultBeplanting | Gras | Haag | MechLeiding | NatBeplanting | Rioolput | VrijvLeiding | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning>;
  clazz?: string;
  objectGuid?: string;
  objecttype: string;
}
