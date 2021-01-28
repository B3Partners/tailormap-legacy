/* tslint:disable */
/* eslint-disable */
import { Feature } from './feature';
export interface CultBeplantingPlanning extends Feature {
  belang?: number;
  calc_plan_code?: string;
  calc_plan_id?: string;
  calc_plan_name?: string;
  cult_beplanting_id?: string;
  data_guid?: string;
  frequentie?: number;
  gepland_uitgevoerd?: string;
  hoeveelheid?: number;
  id?: number;
  jaarvanuitvoering?: number;
  kosten?: number;
  maatregel_cultbepl?: string;
  maatregelgroep?: string;
  maatregeltype?: string;
  planstatus?: string;
  werkeenheid?: string;
}
