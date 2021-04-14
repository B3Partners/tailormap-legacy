/* tslint:disable */
/* eslint-disable */
import { Boom } from './boom';
import { Boominspectie } from './boominspectie';
import { Boomonderhoud } from './boomonderhoud';
import { Boomplanning } from './boomplanning';
import { CultBeplanting } from './cult-beplanting';
import { CultBeplantingPlanning } from './cult-beplanting-planning';
import { Gras } from './gras';
import { GrasPlanning } from './gras-planning';
import { Haag } from './haag';
import { HaagPlanning } from './haag-planning';
import { ImborBoom } from './imbor-boom';
import { ImborGroenobject } from './imbor-groenobject';
import { ImborVerhardingsobject } from './imbor-verhardingsobject';
import { Kunstwerk } from './kunstwerk';
import { KunstwerkPlanning } from './kunstwerk-planning';
import { KunstwerkdeelPlanning } from './kunstwerkdeel-planning';
import { MechLeiding } from './mech-leiding';
import { MechLeidingPlanning } from './mech-leiding-planning';
import { NatBeplanting } from './nat-beplanting';
import { NatBeplantingOnderhoud } from './nat-beplanting-onderhoud';
import { Plantenbak } from './plantenbak';
import { PlantenbakPlanning } from './plantenbak-planning';
import { Rioolput } from './rioolput';
import { RioolputInspectie } from './rioolput-inspectie';
import { RioolputPlanning } from './rioolput-planning';
import { VrijvLeiding } from './vrijv-leiding';
import { VrijvLeidingPlanning } from './vrijv-leiding-planning';
import { Weginspectie } from './weginspectie';
import { Wegvakonderdeel } from './wegvakonderdeel';
import { Wegvakonderdeelplanning } from './wegvakonderdeelplanning';
import { RelatedFeatureType } from '../../attribute-service/attribute-models';
import { Ikwplanningnentot } from './ikwplanningnentot';
export interface Feature {
  children?: Array<Boom | Boominspectie | Boomonderhoud | Boomplanning | CultBeplanting | CultBeplantingPlanning | Gras | GrasPlanning | Haag | HaagPlanning | ImborBoom | ImborGroenobject | ImborVerhardingsobject | Kunstwerk | KunstwerkPlanning | KunstwerkdeelPlanning | MechLeiding | MechLeidingPlanning | NatBeplanting | NatBeplantingOnderhoud | Plantenbak | PlantenbakPlanning | Rioolput | RioolputInspectie | RioolputPlanning | VrijvLeiding | VrijvLeidingPlanning | Weginspectie | Wegvakonderdeel | Wegvakonderdeelplanning | Ikwplanningnentot>;
  clazz?: string;
  objectGuid?: string;
  objecttype: string;
  relatedFeatureTypes: RelatedFeatureType[];
}
