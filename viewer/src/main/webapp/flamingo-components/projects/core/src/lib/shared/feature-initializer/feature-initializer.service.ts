import { Injectable } from '@angular/core';
import {Feature, Wegvakonderdeel, Wegvakonderdeelplanning} from "../generated";

@Injectable({
  providedIn: 'root'
})
export class FeatureInitializerService {


  public static readonly STUB_OBJECT_GUID_NEW_OBJECT = "-1";
  constructor() { }

  public create(type: string, params: any) :Feature{
    params.clazz = type.toLowerCase();
    params.objecttype = type;
    params.object_guid = FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT;
    switch(type){
      case 'Wegvakonderdeel':
        let wv : Wegvakonderdeel = {
          aanlegjaar: 0,
          aanzien: "",
          beheerder: "",
          bestek_nr: "",
          binnen_kom: "",
          breedte: 0,
          children: [],
          comfort: "",
          duurzaamheid: "",
          fid: 0,
          functie_weg: "",
          functie_weg_plus: "",
          fysiekvoorkomenwegplus: "",
          geometrie: undefined,
          id: 0,
          lengte: 0,
          openbare_ruimte: "",
          oppervlakte: 0,
          rijstrook: "",
          std_structuurelement: "",
          veiligheid: "",
          verhardingsfunctie: "",
          verhardingssoort: "",
          verhardingstype: "",
          wegtype: "",
          wijk: "",
          woonplaats: "",
          ...params,
        };
        return wv;
      case 'Wegvakonderdeelplanning':
         let wvp : Wegvakonderdeelplanning ={
           children: [],
           fid: 0,
           geometrie: undefined,
           hoeveelheid: 0,
           id: 0,
           jaarvanuitvoering: 0,
           kosten: 0,
           maatregel_wvko: "",
           maatregeltype: "",
           wegvakonderdeel_id: "",
           ...params,
         };
        return wvp;
    }
  }
}
