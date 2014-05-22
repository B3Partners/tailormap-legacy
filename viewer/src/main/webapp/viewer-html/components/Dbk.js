
Ext.define ("viewer.components.Dbk",{
    extend: "viewer.components.Component",
    
    dbkComponentName: "dbk1",
    
    constructor: function (conf){
        var me = this;
        
        console.log("viewer.components.Dbk.constructor");

        viewer.components.Dbk.superclass.constructor.call(this,conf);
        //----------------------------------------------------------------------
        // OVERRIDE DE STANDAARD getProperties METHODE.
        //----------------------------------------------------------------------
        viewer.components.Print.prototype.getProperties = function(){
            console.log("viewer.components.Print.prototype.getProperties");
            var properties = this.getValuesFromContainer(this.panel);
            properties.angle = this.rotateSlider.getValue();
            properties.quality = this.qualitySlider.getValue();
            properties.appId = this.viewerController.app.id;
            var mapProperties=this.getMapValues();        
            Ext.apply(properties, mapProperties);
            
            // Voeg de extra DBK properties toe.
            var dbkProperties=me.getObjectProperties();        
            Ext.apply(properties,dbkProperties);
            
            return properties;
        };
      
        return this;
    },
    getPrintPropertyNames: function() {
        var propNames = [
             "identificatie",
             "formeleNaam",
             "informeleNaam",
             "hoogsteBouwlaag",
             "bouwlaag",
             "verblijf", 
             "adres",
             "bijzonderheid",
             "contact",
             "verdiepingen",
             "foto",
             "gevaarlijkestof"];
         return propNames;
    },
    getObjectProperties: function() {
       var currentDbkObject;
       var newDbkObject;
       var newDbkObjectXml;
       var propNames;
       var propName;
       var verblijf;
       var printExtra;
       var x2js;
       var len;
       var i;
        
        // Haal het huidig dbk-object.
        currentDbkObject = this.getCurrentObject();

        // Geen dbk-object actief?
        if (!currentDbkObject) {
            return {};
        }

        // Haal alle namen van de relevante properties.
        propNames = this.getPrintPropertyNames();

        // Maak een kopie.
        newDbkObject = {};
        Ext.apply(newDbkObject,currentDbkObject);

        // Gooi niet relevante properties en ook geometries weg.
        for (propName in newDbkObject) {
            if (newDbkObject.hasOwnProperty(propName)) {
                if (propNames.indexOf(propName)<0) {
                    // Verwijder property.
                    delete newDbkObject[propName];
                } else {
                    // Geometry property aanwezig?
                    if (typeof newDbkObject[propName]["geometry"] !== "undefined") {
                        delete newDbkObject[propName]["geometry"];
                    } else {
                        // Array?
                        if ((newDbkObject[propName].length) && (newDbkObject[propName].length>0)) {
                            for (i=0,len=newDbkObject[propName].length;i<len;i++) {
                                if (typeof newDbkObject[propName][i]["geometry"] !== "undefined")
                                    delete newDbkObject[propName][i]["geometry"];
                            }
                        }
                    }
                }
            }
        }
        
        // Pas verblijf tijden aan, HH:MM:SS wordt HH:MM.
        if ((newDbkObject.verblijf) && (newDbkObject.verblijf.length)) {
            for (i=0,len=newDbkObject.verblijf.length;i<len;i++) {
                verblijf = newDbkObject.verblijf[i];
                if (verblijf.tijdvakBegintijd) {
                    verblijf.tijdvakBegintijd = this.stripSeconds(verblijf.tijdvakBegintijd);
                }
                if (verblijf.tijdvakEindtijd) {
                    verblijf.tijdvakEindtijd = this.stripSeconds(verblijf.tijdvakEindtijd);
                }
            }
        }

        // Maak de JSON structuur voor de Print API.
        // 
        // Uiteindelijk moet het in deze structuur:
        //     "extra": [{
        //        "info": ["<info class="..." componentname="dbk1">...[xmlany]...</info>"]
        //     }],

        // Converteer de object json naar xml.
      	x2js = new X2JS();
        newDbkObjectXml = x2js.json2xml_str(newDbkObject);

        // Voeg de <info class="..." componentname="dbk1"> toe.
        newDbkObjectXml = '<info class="'+this.dbkComponentName+
                           '" componentname="'+this.dbkComponentName+'">'+
                           newDbkObjectXml + '</info>';

        // Maak de print API structuur.
//        printExtra = {
//            "extra": [{
//                "info": [
//                    newDbkObjectXml
//                ]
//            }]            
//        };
        var printExtra = {"extra": {
            "info": [newDbkObjectXml]
        }};

        // En geef deze terug.
        return printExtra;

//        // Voeg de componentnaam toe.
//        Ext.apply(newDbkObject,{"componentname": this.dbkComponentName});
//
//        // Maak de structuur.
//        printExtra = {
//            "extra": [{
//                "info": [
//                    newDbkObject
//                ]
//            }]            
//        };
//        return printExtra;
        
//        // Converteer de json naar xml.
//      	x2js = new X2JS();
//        newDbkObjectXml = x2js.json2xml_str(newDbkObject);
//
//        // Maak een object met "extra" als root.
//        return {"extra" : newDbkObjectXml};
    },
    getCurrentObject: function() {
        var dbkObject;
        dbkObject = {
            "identificatie": 1398855326,
            "BHVaanwezig": false,
            "controleDatum": "2014-04-30 15:21:34.972",
            "formeleNaam": "Bisonspoor 332 Maarssen",
            "informeleNaam": "",
            "OMSnummer": "34324",
            "inzetprocedure": null,
            "laagsteBouwlaag": 0,
            "hoogsteBouwlaag": 0,
            "bouwlaag": "BG",
            "risicoklasse": "",
            "gebouwconstructie": null,
            "gebruikstype": "kantoorfunctie",
            "verwerkt": null,
            "verblijf": [{
                    "typeAanwezigheidsgroep": "Bewoners",
                    "aantal": "3432",
                    "aantalNietZelfredzaam": "324",
                    "tijdvakBegintijd": "10:00:00",
                    "tijdvakEindtijd": "17:00:00",
                    "maandag": true,
                    "dinsdag": true,
                    "woensdag": true,
                    "donderdag": true,
                    "vrijdag": true,
                    "zaterdag": false,
                    "zondag": false
                }],
            "adres": [{
                    "bagId": 1398855327,
                    "openbareRuimteNaam": "Bisonspoor",
                    "huisnummer": 6002,
                    "huisletter": "",
                    "woonplaatsNaam": "Maarssen",
                    "gemeenteNaam": "Stichtse Vecht",
                    "adresseerbaarObject": null,
                    "typeAdresseerbaarObject": "",
                    "huisnummertoevoeging": "",
                    "postcode": "3605LT"
                }],
            "afwijkendebinnendekking": [{
                    "alternatieveCommInfrastructuur": "",
                    "dekking": true,
                    "aanvullendeInformatie": "",
                    "geometry": {
                        "type": "Point",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [130500.1, 460744.5]
                    }
                }, {
                    "alternatieveCommInfrastructuur": "",
                    "dekking": false,
                    "aanvullendeInformatie": "",
                    "geometry": {
                        "type": "Point",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [130503.6, 460769.2]
                    }
                }, {
                    "alternatieveCommInfrastructuur": "DMO",
                    "dekking": true,
                    "aanvullendeInformatie": "",
                    "geometry": {
                        "type": "Point",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [130496, 460756.8]
                    }
                }],
            "bijzonderheid": [{
                    "seq": 1,
                    "soort": "Algemeen",
                    "tekst": "retrt"
                }],
            "brandcompartiment": [{
                    "typeScheiding": "> 60 minuten brandwerende scheiding",
                    "Label": "180",
                    "aanvullendeInformatie": null,
                    "geometry": {
                        "type": "MultiLineString",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [[[130496.9, 460727.1], [130515.4, 460745.1]]]
                    }
                }, {
                    "typeScheiding": "> 60 minuten brandwerende scheiding",
                    "Label": "20",
                    "aanvullendeInformatie": null,
                    "geometry": {
                        "type": "MultiLineString",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [[[130511.9, 460715.9], [130528.6, 460731.8]]]
                    }
                }, {
                    "typeScheiding": "60 minuten brandwerende scheiding",
                    "Label": null,
                    "aanvullendeInformatie": null,
                    "geometry": {
                        "type": "MultiLineString",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [[[130486, 460737.7], [130518.3, 460770.6], [130526, 460762.7]]]
                    }
                }, {
                    "typeScheiding": "30 minuten brandwerende scheiding",
                    "Label": null,
                    "aanvullendeInformatie": null,
                    "geometry": {
                        "type": "MultiLineString",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [[[130446.9, 460699], [130454.2, 460722.6]]]
                    }
                }],
            "brandweervoorziening": [{
                    "typeVoorziening": "Tb1.001",
                    "naamVoorziening": "Brandweeringang",
                    "namespace": "nen1414",
                    "aanvullendeInformatie": "",
                    "hoek": 45,
                    "radius": 12,
                    "geometry": {
                        "type": "Point",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [130434.2, 460704.9]
                    }
                }, {
                    "typeVoorziening": "Tb1.001",
                    "naamVoorziening": "Brandweeringang",
                    "namespace": "nen1414",
                    "aanvullendeInformatie": "",
                    "hoek": 0,
                    "radius": 12,
                    "geometry": {
                        "type": "Point",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [130454.5, 460728.4]
                    }
                }, {
                    "typeVoorziening": "Tb1.003",
                    "naamVoorziening": "Sleutelkluis",
                    "namespace": "nen1414",
                    "aanvullendeInformatie": "",
                    "hoek": 0,
                    "radius": 12,
                    "geometry": {
                        "type": "Point",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [130423.9, 460727.4]
                    }
                }, {
                    "typeVoorziening": "Tb2.021",
                    "naamVoorziening": "Afsluiter gas",
                    "namespace": "nen1414",
                    "aanvullendeInformatie": "Let op zit onder trap",
                    "hoek": 0,
                    "radius": 12,
                    "geometry": {
                        "type": "Point",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [130484.8, 460719.8]
                    }
                }, {
                    "typeVoorziening": "Tb1.008",
                    "naamVoorziening": "Opstelplaats eerste blusvoertuig",
                    "namespace": "nen1414",
                    "aanvullendeInformatie": "",
                    "hoek": 0,
                    "radius": 14,
                    "geometry": {
                        "type": "Point",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [130478.1, 460729.8]
                    }
                }],
            "verdiepingen": [{
                    "identificatie": 1398855326,
                    "bouwlaag": "BG",
                    "type": "hoofdobject"
                }],
            "contact": [{
                    "functie": "Contact",
                    "naam": "object",
                    "telefoonnummer": "0633242324"
                }],
            "foto": [{
                    "naam": "1398855326_A.jpg",
                    "URL": "1398855326_A.jpg",
                    "filetype": "afbeelding"
                }, {
                    "naam": "FO versnelling Care.docx",
                    "URL": "1398855326-FO versnelling Care.docx",
                    "filetype": "document"
                }, {
                    "naam": "Zones_Provincies_Belgie_Dec2012.png",
                    "URL": "1398855326-Zones_Provincies_Belgie_Dec2012.png",
                    "filetype": "afbeelding"
                }, {
                    "naam": "https://nu.nl",
                    "URL": "https://nu.nl",
                    "filetype": "weblink"
                }],
            "gevaarlijkestof": [{
                    "naamStof": "",
                    "gevaarsindicatienummer": 0,
                    "UNnummer": 0,
                    "hoeveelheid": "",
                    "symboolCode": "EU-GHS05",
                    "aanvullendeInformatie": "",
                    "geometry": {
                        "type": "Point",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [130376.9, 460744.8]
                    }
                }, {
                    "naamStof": "",
                    "gevaarsindicatienummer": 0,
                    "UNnummer": 0,
                    "hoeveelheid": "",
                    "symboolCode": "EU-GHS02",
                    "aanvullendeInformatie": "",
                    "geometry": {
                        "type": "Point",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [130490.7, 460665.7]
                    }
                }, {
                    "naamStof": "",
                    "gevaarsindicatienummer": 0,
                    "UNnummer": 0,
                    "hoeveelheid": "",
                    "symboolCode": "EU-GHS07",
                    "aanvullendeInformatie": "",
                    "geometry": {
                        "type": "Point",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [130455.4, 460708.7]
                    }
                }],
            "hulplijn": [{
                    "typeHulplijn": "Conduit",
                    "aanvullendeInformatie": null,
                    "geometry": {
                        "type": "MultiLineString",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [[[130436, 460687.4], [130468.6, 460683.6], [130481.9, 460673], [130486.3, 460655.4]]]
                    }
                }, {
                    "typeHulplijn": "Cable",
                    "aanvullendeInformatie": null,
                    "geometry": {
                        "type": "MultiLineString",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [[[130441.6, 460677.1], [130439.8, 460659.8], [130449.5, 460649.2], [130468.3, 460643.9], [130487.2, 460650.1]]]
                    }
                }],
            "pandgeometrie": [{
                    "bagId": "",
                    "bagStatus": null,
                    "geometry": {
                        "type": "MultiPolygon",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [[[[130461.6, 460711.3], [130461.6, 460712.3], [130461.5, 460713.3], [130461.4, 460714.2], [130461.2, 460715.2], [130460.9, 460716.1], [130460.6, 460717], [130460.2, 460717.9], [130459.8, 460718.7], [130459.3, 460719.6], [130458.7, 460720.4], [130458.1, 460721.1], [130457.5, 460721.9], [130456.8, 460722.6], [130456.1, 460723.2], [130455.3, 460723.8], [130454.5, 460724.4], [130453.7, 460724.9], [130452.8, 460725.3], [130452, 460725.7], [130451.1, 460726], [130450.1, 460726.3], [130449.2, 460726.5], [130448.2, 460726.7], [130447.3, 460726.8], [130446.3, 460726.8], [130445.3, 460726.8], [130444.4, 460726.8], [130443.4, 460726.6], [130442.4, 460726.4], [130441.5, 460726.2], [130440.6, 460725.9], [130439.7, 460725.5], [130438.8, 460725.1], [130438, 460724.6], [130437.2, 460724.1], [130436.4, 460723.5], [130435.6, 460722.9], [130434.9, 460722.2], [130434.3, 460721.5], [130433.7, 460720.8], [130433.1, 460720], [130432.6, 460719.2], [130432.1, 460718.3], [130431.7, 460717.4], [130431.4, 460716.6], [130431.1, 460715.6], [130430.8, 460714.7], [130430.6, 460713.8], [130430.5, 460712.8], [130430.5, 460711.8], [130430.5, 460710.9], [130430.5, 460709.9], [130430.6, 460708.9], [130430.8, 460708], [130431.1, 460707.1], [130431.4, 460706.1], [130431.7, 460705.3], [130432.1, 460704.4], [130432.6, 460703.5], [130433.1, 460702.7], [130433.7, 460701.9], [130434.3, 460701.2], [130434.9, 460700.5], [130435.6, 460699.8], [130436.4, 460699.2], [130437.2, 460698.6], [130438, 460698.1], [130438.8, 460697.6], [130439.7, 460697.2], [130440.6, 460696.8], [130441.5, 460696.5], [130442.4, 460696.3], [130443.4, 460696.1], [130444.4, 460695.9], [130445.3, 460695.9], [130446.3, 460695.9], [130447.3, 460695.9], [130448.2, 460696], [130449.2, 460696.2], [130450.1, 460696.4], [130451.1, 460696.7], [130452, 460697], [130452.8, 460697.4], [130453.7, 460697.8], [130454.5, 460698.3], [130455.3, 460698.9], [130456.1, 460699.5], [130456.8, 460700.1], [130457.5, 460700.8], [130458.1, 460701.6], [130458.7, 460702.3], [130459.3, 460703.1], [130459.8, 460704], [130460.2, 460704.8], [130460.6, 460705.7], [130460.9, 460706.6], [130461.2, 460707.5], [130461.4, 460708.5], [130461.5, 460709.4], [130461.6, 460710.4], [130461.6, 460711.3]]]]
                    }
                }, {
                    "bagId": "",
                    "bagStatus": null,
                    "geometry": {
                        "type": "MultiPolygon",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [[[[130460.1, 460667.1], [130476.9, 460656.2], [130482.8, 460660.4], [130469.2, 460676.5], [130450.7, 460680.9], [130444.2, 460666.5], [130456.3, 460649.8], [130460.1, 460667.1]]]]
                    }
                }, {
                    "bagId": "0333100000019211",
                    "bagStatus": null,
                    "geometry": {
                        "type": "MultiPolygon",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [[[[130520.1, 460744.5], [130520, 460744.4], [130520.5, 460743.7], [130520.7, 460743.5], [130519.8, 460742.4], [130512.8, 460749.2], [130515, 460751.4], [130516.1, 460750.3], [130537.4, 460772.3], [130548.7, 460784.6], [130574.3, 460759.9], [130574.2, 460758.8], [130582.4, 460758.3], [130582.6, 460757.8], [130582.8, 460757.6], [130594.8, 460770.1], [130634.7, 460811.6], [130634.8, 460811.5], [130635.2, 460811.9], [130634.8, 460812.3], [130634.7, 460812.2], [130632.6, 460814.3], [130633.6, 460815.3], [130633.9, 460815.1], [130637.5, 460818.9], [130639.7, 460816.8], [130645.1, 460822.4], [130629.3, 460837.7], [130624.2, 460832.5], [130622, 460834.7], [130617.9, 460830.5], [130618.2, 460830.3], [130617.1, 460829.2], [130611.2, 460834.9], [130609.2, 460836.8], [130633.8, 460862.6], [130633.9, 460862.5], [130634.3, 460862.9], [130634.4, 460862.8], [130636.8, 460865.3], [130636.7, 460865.3], [130636.7, 460865.9], [130636.8, 460866.1], [130626.1, 460876.3], [130626, 460876.1], [130626.2, 460875.9], [130623.6, 460873.2], [130623.6, 460873.3], [130623.5, 460873.2], [130622.3, 460874.4], [130620, 460876.5], [130617.2, 460879.3], [130617.5, 460879.6], [130615, 460882.1], [130614.6, 460881.6], [130613.5, 460882.7], [130616.2, 460885.6], [130616.4, 460885.4], [130616.6, 460885.6], [130600.1, 460901.5], [130599.8, 460901.2], [130600.1, 460901], [130588.4, 460888.9], [130588.6, 460888.6], [130567.6, 460866.9], [130557.4, 460876.8], [130552, 460882], [130526.5, 460906.7], [130552.8, 460934.2], [130548.9, 460937.7], [130534.5, 460951.7], [130535.1, 460952.3], [130518.1, 460968.7], [130517.4, 460968], [130514.3, 460971], [130511.7, 460970.9], [130506.3, 460970.8], [130462.3, 460924.9], [130462.2, 460919.9], [130465.4, 460916.7], [130465.5, 460914.7], [130466.8, 460913.3], [130461.7, 460908.1], [130461.8, 460908], [130461.8, 460907.9], [130461.8, 460903.4], [130468.5, 460897], [130463.8, 460892.2], [130463.3, 460892.8], [130463.2, 460892.7], [130463.5, 460892.4], [130464.5, 460891.3], [130465.7, 460890.1], [130466.8, 460889], [130467.2, 460888.5], [130468.5, 460887.4], [130469.7, 460886.3], [130471, 460885.2], [130471.1, 460885.2], [130469.9, 460886.3], [130471.9, 460888.3], [130496.2, 460864.9], [130496.7, 460865.4], [130502, 460865.5], [130504.1, 460863.4], [130501.1, 460860.2], [130506.3, 460855.1], [130496.4, 460845.2], [130502.8, 460839.1], [130502.9, 460835.8], [130505.3, 460833.4], [130505.5, 460826.2], [130503.6, 460824.2], [130501, 460824.1], [130458.6, 460780.3], [130466.4, 460772.6], [130461.9, 460768], [130463, 460766.8], [130463.1, 460765.2], [130462, 460764], [130462, 460762.6], [130465.1, 460759.5], [130463.1, 460757.4], [130463.4, 460757.2], [130461, 460754.5], [130460.9, 460754.6], [130459.9, 460755.7], [130459.8, 460755.7], [130460.6, 460754.8], [130461.7, 460753.6], [130462.8, 460752.4], [130464, 460751.3], [130465.1, 460750.2], [130466.3, 460749.2], [130467.6, 460748.1], [130467.6, 460748.2], [130466.5, 460749.2], [130467.7, 460750.5], [130467.9, 460750.4], [130469.1, 460751.7], [130469, 460751.9], [130469.2, 460752.1], [130478.7, 460743], [130478.6, 460742.9], [130483.6, 460738.1], [130483.7, 460738.2], [130488.4, 460733.7], [130488.3, 460733.6], [130493.1, 460728.9], [130493.2, 460729], [130497.9, 460724.5], [130497.8, 460724.4], [130518.3, 460704.6], [130524.3, 460704.7], [130540.9, 460721.9], [130540.8, 460722.1], [130525.8, 460736.6], [130526.8, 460737.6], [130527.1, 460737.3], [130527.8, 460736.9], [130527.2, 460737.7], [130527.1, 460737.7], [130526, 460739], [130524.8, 460740.2], [130523.6, 460741.3], [130522.4, 460742.5], [130521.1, 460743.6], [130520.1, 460744.5]]]]
                    }
                }, {
                    "bagId": "0333100000018870",
                    "bagStatus": null,
                    "geometry": {
                        "type": "MultiPolygon",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [[[[130502, 460689.9], [130504.5, 460692.1], [130482.5, 460713], [130480.7, 460710.3], [130478.3, 460707.7], [130475.4, 460704.7], [130465.6, 460694.5], [130465.4, 460694.3], [130486.3, 460674.1], [130486.6, 460673.8], [130486.8, 460674], [130490.9, 460678.4], [130491.9, 460679.3], [130500, 460687.8], [130502, 460689.9]]]]
                    }
                }],
            "tekstobject": null,
            "toegangterrein": [{
                    "primair": true,
                    "naamRoute": "Route eerste TS (Primair)",
                    "aanvullendeInformatie": "",
                    "geometry": {
                        "type": "MultiLineString",
                        "crs": {
                            "type": "name",
                            "properties": {
                                "name": "EPSG:28992"
                            }
                        },
                        "coordinates": [[[130509.2, 460660.4], [130523.3, 460685.4], [130545.1, 460710.7], [130567.5, 460734.8], [130555.1, 460755.9]]]
                    }
                }]
        };
        return dbkObject;
    },
    getExtComponents: function() {
        return [];
    },
    // Geeft van de string "HH:MM:SS" alleen de "HH:MM" terug.
    stripSeconds: function(s) {
        var tokens;
        if (s.trim()==="")
            return s;
        tokens = s.split(":");
        if (tokens.length===3)
            return tokens[0] + ":" + tokens[1];
        else
            return s;
    }
});

//Ext.define ("viewer.components.Dbk",{
//    extend: "viewer.components.Component",    
//    constructor: function (conf){
//        if (!conf){
//            conf={};            
//        }if (!conf.decimals){
//            conf.decimals=2;
//        }
//        viewer.components.Dbk.superclass.constructor.call(this, conf);        
//        this.initConfig(conf);
//        
//        conf.id=conf.name;
//        conf.type=viewer.viewercontroller.controller.Component.COORDINATES;
//        
//        var comp = this.viewerController.mapComponent.createComponent(conf);
//        this.viewerController.mapComponent.addComponent(comp);
//        
//        return this;
//    },
//    getExtComponents: function() {
//        return [];
//    }
//});
