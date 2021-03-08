/* eslint-disable */
import { Feature } from './feature';
export interface HaagPlanning extends Feature {
  belang?: number;
  calc_plan_code?: string;
  calc_plan_id?: string;
  calc_plan_name?: string;
  data_guid?: string;
  frequentie?: number;
  gepland_uitgevoerd?: string;
  haag_id?: string;
  hoeveelheid?: number;
  id?: number;
  jaarvanuitvoering?: number;
  kosten?: number;
  maatregel_haag?: string;
  maatregelgroep?: string;
  maatregeltype?: string;
  planstatus?: string;
  werkeenheid?: string;
}
