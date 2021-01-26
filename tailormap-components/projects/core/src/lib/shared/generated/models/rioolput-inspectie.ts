/* tslint:disable */
import { Feature } from './feature';
export interface RioolputInspectie extends Feature {
  dab_scheur?: number;
  dac_breuk_instorting?: number;
  dad_defect_metselwerk?: number;
  daf_schade_oppervlak?: number;
  data_guid?: string;
  dba_wortels?: number;
  dbd_binnendringen_grond?: number;
  dbf_infiltratie?: number;
  id?: number;
  inspectiedatum?: string;
  rioolput_id?: string;
}
