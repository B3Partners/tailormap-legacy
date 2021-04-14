/* tslint:disable */
/* eslint-disable */
import { Feature } from './feature';
export interface KunstwerkdeelPlanning extends Feature {
  data_guid?: string;
  frequentie?: number;
  gepland_uitgevoerd?: string;
  hoeveelheid?: number;
  id?: number;
  jaarvanuitvoering?: number;
  kosten?: number;
  kunstwerkdeel_id?: string;
  maatregel_kwd?: string;
  maatregeltype?: string;
  planstatus?: string;
}
