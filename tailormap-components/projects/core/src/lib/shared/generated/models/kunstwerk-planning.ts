/* tslint:disable */
/* eslint-disable */
import { Feature } from './feature';
export interface KunstwerkPlanning extends Feature {
  data_guid?: string;
  frequentie?: number;
  gepland_uitgevoerd?: string;
  hoeveelheid?: number;
  id?: number;
  jaarvanuitvoering?: number;
  kosten?: number;
  kunstwerk_id?: string;
  maatregel_kw?: string;
  maatregeltype?: string;
  planstatus?: string;
}
