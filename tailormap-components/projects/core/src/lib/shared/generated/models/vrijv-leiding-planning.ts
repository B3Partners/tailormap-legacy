/* tslint:disable */
import { Feature } from './feature';
export interface VrijvLeidingPlanning extends Feature {
  afstand_begin?: number;
  afstand_eind?: number;
  belang?: number;
  calc_plan_code?: string;
  calc_plan_id?: string;
  calc_plan_name?: string;
  data_guid?: string;
  dekkingscode?: string;
  eenheidsprijs?: number;
  frequentie?: number;
  gepland_uitgevoerd?: string;
  hoeveelheid?: number;
  hoofdmaatregel?: string;
  id?: number;
  jaarvanuitvoering?: number;
  kosten?: number;
  kostenfactor?: number;
  maatregel_vvrrleid?: string;
  maatregelcode?: string;
  maatregelgroep?: string;
  maatregeltype?: string;
  memo?: string;
  planstatus?: string;
  toeslagen?: string;
  vaste_kosten?: number;
  vrijv_leiding_id?: string;
}
