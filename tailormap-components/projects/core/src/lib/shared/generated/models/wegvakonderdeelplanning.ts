/* tslint:disable */
/* eslint-disable */
import { Feature } from './feature';
export interface Wegvakonderdeelplanning extends Feature {
  belang?: number;
  binnen_kom?: boolean;
  calc_plan_code?: string;
  calc_plan_id?: string;
  calc_plan_name?: string;
  data_guid?: string;
  dekkingscode?: string;
  eenheidsprijs?: number;
  frequentie?: number;
  gepland_uitgevoerd?: boolean;
  hoeveelheid?: number;
  id?: number;
  jaarvanuitvoering?: number;
  kosten?: number;
  kosten_per_eenheid?: number;
  kostenfactor?: number;
  maatregel_kopie?: string;
  maatregel_wvko?: string;
  maatregelgroep?: string;
  maatregeltype?: string;
  memo?: string;
  planstatus?: string;
  std_verhardingssoort?: string;
  toeslagen?: string;
  vaste_kosten?: number;
  verhardingstype?: string;
  wegtype?: string;
  wegvakonderdeel_id?: string;
}
