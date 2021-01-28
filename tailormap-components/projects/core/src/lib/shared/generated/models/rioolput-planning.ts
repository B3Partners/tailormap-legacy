/* tslint:disable */
/* eslint-disable */
import { Feature } from './feature';
export interface RioolputPlanning extends Feature {
  data_guid?: string;
  frequentie?: number;
  gepland_uitgevoerd?: string;
  hoeveelheid?: number;
  id?: number;
  jaarvanuitvoering?: number;
  kosten?: number;
  maatregel_rlput?: string;
  maatregeltype?: string;
  planstatus?: string;
  rioolput_id?: string;
}
