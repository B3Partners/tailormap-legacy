/* tslint:disable */
import { Feature } from './feature';
export interface MechLeidingPlanning extends Feature {
  data_guid?: string;
  frequentie?: number;
  gepland_uitgevoerd?: string;
  hoeveelheid?: number;
  id?: number;
  jaarvanuitvoering?: number;
  kosten?: number;
  maatregel_merlleid?: string;
  maatregeltype?: string;
  mech_leiding_id?: string;
  planstatus?: string;
}
