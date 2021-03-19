/* eslint-disable */
import { Feature } from './feature';
export interface NatBeplantingOnderhoud extends Feature {
  belang?: number;
  calc_plan_code?: string;
  calc_plan_id?: string;
  calc_plan_name?: string;
  data_guid?: string;
  frequentie?: number;
  gepland_uitgevoerd?: string;
  hoeveelheid?: number;
  id?: number;
  jaarvanuitvoering?: number;
  kosten?: number;
  maatregel_nat_bepl?: string;
  maatregelgroep?: string;
  maatregeltype?: string;
  nat_beplanting_id?: string;
  planstatus?: string;
  werkeenheid?: string;
}
