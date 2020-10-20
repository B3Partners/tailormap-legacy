/* tslint:disable */
import { Feature } from './feature';
export interface Boomplanning extends Feature {
  boom_id?: string;
  calc_plan_code?: string;
  calc_plan_id?: string;
  calc_plan_name?: string;
  data_guid?: string;
  fid?: number;
  frequentie?: number;
  gepland_uitgevoerd?: string;
  hoeveelheid?: number;
  id?: number;
  jaarvanuitvoering?: number;
  kosten?: number;
  maatregel_boom?: string;
  maatregeltype?: string;
  planstatus?: string;
  werkeenheid?: string;
}
