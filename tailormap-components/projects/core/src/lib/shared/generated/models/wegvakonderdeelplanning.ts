/* tslint:disable */
import { Feature } from './feature';
export interface Wegvakonderdeelplanning extends Feature {
  fid?: number;
  hoeveelheid?: number;
  id?: number;
  jaarvanuitvoering?: number;
  kosten?: number;
  maatregel_wvko?: string;
  maatregeltype?: string;
  wegvakonderdeel_id?: string;
}
