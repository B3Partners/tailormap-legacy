var layerJSON = {
    layers:[]
};

var avoIds = "kanoroute,mtbroute,law_knelpt,lf_knelpt,regio_tvoost,biro2010,N340_bpEnkel,strooi_prov,bvb,kulturhus_mfa,top,energie_pro_biomassa,energie_pro_besparing,energie_pro_kwo,energie_pro_wind,energie_pro_zon,energie_pro_overig,stortplaats,asbest_loc,bouwarchief_niet_gem,bouwarchief_gem,bodemarchief,biro,rijkswegen,vaarwegen,provwegen,luchtkwaliteit_2008_N,luchtkwaliteit_2008_P,overijssel_geluid_lden_rijksw_2006,overijssel_geluid_lnight_rijksw_2006,overijssel_geluid_lden_provw_2006,overijssel_geluid_lnight_provw_2006,natlands,natpark,froutenetwerk,lfroute,lawroute,nat2000,rec_camping,rec_bungalowpark,rec_jachthaven,rec_groepsaccommodatie,recon_zone_polygon,wav_polygon,verzuur_polygon,waterwin_polygon,intrekgebied,grwbes_polygon,rayonwk_polygon,hemelhelderheid_polygon,wbe_polygon,ibis,watschap_ned_polygon,geomorfologie,LGN6,corop,habitattypen_id,ehs,rvz,evz,station,nb_wet,rijksmonumenten,gemeentelijkemonumenten,groenloket_natuurbeheertypen,groenloket_nieuwenatuur_beh,groenloket_nieuwenatuur_amb,groenloket_landschapselementen_beh,groenloket_agrbeh_weidevogel_beh,groenloket_agrbeh_botgrasland_beh,groenloket_agrbeh_botakkerland_beh,groenloket_ganzen_beh,groenloket_probleemgebieden,groenloket_schaapskudde_toeslag,groenloket_rvz_beh,groenloket_evz,groenloket_natuurbeheertypen_amb,groenloket_landschapselementen_amb,groenloket_agrbeh_weidevogel_amb,groenloket_agrbeh_botgrasland_amb,groenloket_agrbeh_botakkerland_amb,groenloket_ganzen_amb,groenloket_rvz_amb,groenloket_evz_amb,salland,boringvrij,fknooppunt,zwemwater_o,zwemwater_no,zwemwater_kand_o,zwemwater_kand_no,bag_pand,bag_adres,bag_ligplaats,bag_adres_ligplaats,bag_standplaats,bag_adres_standplaats,bag_verblijfsobject" ;
var avoArray = avoIds.split(",");

function loadAvo(){
    for( var i = 0 ; i < avoArray.length && i < 50 ; i++){
        var visible = false;
        if( i < 5){
            visible = true;
        }
        var layerId = avoArray[i];
        var laag = {
            server:"gisopenbaar.overijssel.nl", 
            servlet:"GeoJuli2008/ims",
            mapservice:"atlasoverijssel",
            id:"avo_"+layerId,
            name: layerId,
            visible: visible,
            type: "ArcIMS"
        
        };
        layerJSON.layers.push(laag);
    }
    
}

var omgevingsVisieIds = "buitengebied,groene_hoofdstr,log,steden_als_motor,glastuinbouw,vaarweg,EHS_lijn_EVZ_2,EHS_lijn_RVZ_ntb_2,windenergie,water5,water1,water2,water3,spoor,vervoersnetwerk,vervoersnetwerk2,hist_kern,op_kenniscentra,airport_twente,stationsgebied,overslagcentrum,natuurlijke_laag,beken,agrarisch_cultuurlandschap,verblijfsrecreatie_lust,vaarweg_lenl,lfroute,lawroute,fronten,donkerte,buitenplaats,attracties,lfroute_arc,lawroute_arc,wandelnetwerk_twente,rec_steenwijk,water_arc_recr,froutenetwerk,intrekgebieden,sted_intrekgebieden,salland,boringsvrij,waterwin_polygon,sted_grwbesgebied,grwbesgebied,nationale_landschappen,EHS_lijn_RVZ_ntb,EHS_lijn_EVZ,EHS,historische_kern,stedelijke_laag_area,s_vervoersnetwerk,s_vervoersnetwerk2,vaarten_Water_arc,dedemsvaart,infrastructuur_spoor_lijn,stations,dijkringgebieden,waterberging_vlak,primaire_watergeb_vhPunt,primaire_watergebieden,waterberging_corr,ess_waterlopen,funnel_twente,laagvliegroute,wegencategorisering,buisleiding,rgsweg,peilbesluiten,vaarwegnrs,vaarwegnr_polygon,primwatkeer,regwatkeer,top_toer,verblijfsrecreatie_punt,lfr,lawr,frn,water_arc_verbl,veenweidegebied,reconzone,behgebied_weidevog,ganzengebied,natpark,natlandschap_visie,hemelhelderheid,zwemplas,stortplaatsen,bodemsan,gem_bodemsanering,zandwinzone,zandwin,zoutwin,zoek_zand,zoek_zout,ibis,zachtplan,wegcat,spoor_visie,weg_visie,water_visie,overslag_visie,fietssnelweg,kwo,kwo_niettot,avk,essen,arch_gebied,EHS_nbk,EHS_nbk_evz,EHS_nbk_rvz,nat2000,TOP,wav,salland_dww,innamezone_dww,intrekgebieden_dww,grwbesgebied_dww,vechtdal_visie,hoofdsysteem_wv,vechte,dijkringgebieden_wv,bypass_wv,winterbed_wv,ruimtevdrivier_wv,wind,uitsl_laagvlieg,uitsl_natlandschap,EHS_wind,EHS_rvz_wind,EHS_evz_wind,blauwehoofdstructuur,waterlopen_wind1,waterlopen_wind2,waterlopen_wind3,kleinewateren_wlwb,hoofdsysteem_wlwb,krw_wlwb,essentielewaterloop_wlwb,primaire_watergebieden_wlwb,primaire_watergeb_vhpunt_wlwb,primaire_watergeb_lijn_wlwb,waterberging_vlak_wlwb,waterberging_lijn_wlwb,wb_zoeklocatie_wlwb,ovnet,bevoegdheidsregios,busWestOv,syntus,connexxion,stadsvervoer,EHS_faunakp,EHS_rvz_faunakp,EHS_evz_faunakp,faunaknelpunten,stadsranden,kleinewateren_wfk,essentielewaterloop_wfk,krw_vlak,krw_vlak1,krw_vlak2,krw,hoofdsysteem,dijkringgebieden_wfk,primairewatkeer_wfk,regionalewatkeer_wfk,ruimtevdrivier,buitendijksgebied,bypass,innamezone,intrekgebieden_wfk,grwbesgebied_wfk,salland_wfk,wb_zoeklocatie,primaire_watergebieden_wfk,primaire_watergeb_vhpunt,primaire_watergeb_lijn_wfk,waterberging_vlak_wfk,waterberging_lijn_wfk,wateraanvoer,zwemplassen_beschermingsgebied,zwemplas_wfk,vaarweg_wfk,recreatievaart,op_groene_hoofdstr,op_kenniscentra,op_waterberging,op_buitenplaats,op_stadsas,op_buitendijks,op_veenweidegebied,op_beekdal,op_drinkwaterwinning,op_stadsranden,op_natlandschap,op_fietssnelweg,op_hist_kern,op_buitengebied,op_log,op_buitengebied_zoekEHS,op_windenergie,op_steden_als_motor,op_glastuinbouw,op_EHS_lijn_RVZ_ntb_2,op_EHS_lijn_EVZ_2,op_vervoersnetwerk,op_spoor,op_luchthaven_airside,op_luchthaven_overgang,op_luchthaven_bedr,op_landelijk_wonenwerken,op_water1,op_water2,op_water3,op_water5,op_vaarweg,op_airport_twente,op_overslagcentrum,op_stationsgebied";
var omgevingsVisieArray = omgevingsVisieIds.split(",");
function loadOmgevingsVisie(){
    for( var i = 0 ; i < omgevingsVisieArray.length && i < 50 ; i++){
        var visible = false;
        /*if( i < 5){
            visible = true;
        }*/
        var layerId = omgevingsVisieArray[i];
        var laag = {
            server:"gisopenbaar.overijssel.nl", 
            servlet:"GeoJuli2008/ims",
            mapservice:"omgevingsvisie",
            id:"omgevingsvisie_"+layerId,
            name: layerId,
            visible: visible,
            type: "ArcIMS"
        };
        layerJSON.layers.push(laag);
    }
}