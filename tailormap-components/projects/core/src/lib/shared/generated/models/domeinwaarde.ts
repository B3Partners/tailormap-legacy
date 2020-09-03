/* tslint:disable */
export interface Domeinwaarde {
  afkorting?: string;
  domein_id?: number;
  id?: number;
  linkedDomeinwaardes?: Array<Domeinwaarde>;
  synoniem?: string;
  volgorde?: number;
  waarde?: string;
}
