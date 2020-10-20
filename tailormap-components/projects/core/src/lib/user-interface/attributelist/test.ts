/**
 * Test data voor panden, straten en bomen.
 */

import { AttributelistHelpers } from './attributelist-common/attributelist-helpers';
import { RowData } from './attributelist-common/attributelist-models';
import {
  AttributeListParameters,
  AttributeListResponse,
  AttributeMetadataParameters,
  AttributeMetadataResponse,
} from '../test-attributeservice/models';
import { AttributeService } from '../../shared/attribute-service/attribute.service';

export class Test {

  public static getAttrWegvakonderdeel(attrService: AttributeService): void {
    const appId = 3;
    const layerId = 16;
    const filter = '';

    const metaParams: AttributeMetadataParameters = {
      application: appId,
      appLayer: layerId,
      // featureType: featTypeId,
    };
    const params: AttributeListParameters = {
      application: appId,
      appLayer: layerId,
      // featureType: featTypeId,
      dir: 'ASC',
      sort: '',
      filter,
    };

    attrService.featureTypeMetadata$(metaParams).subscribe(
      (metaData: AttributeMetadataResponse) => {
        console.log('====');
        console.log(metaData);
      },
      () => {
        console.log('Error!!!')
      },
    );
    attrService.features$(params).subscribe(
      (data: AttributeListResponse) => {
        console.log('====');
        console.log(data);
      },
      () => {
        console.log('Error!!!')
      },
    );
  }

  public static getAttrWegvakonderdeelPlanning(attrService: AttributeService): void {
    // filter: 'wegvakonderdeel_id = 'A0ABA09EB3F045AE80A293639EBEA701''
    // foreignFeatureTypeName: 'wegvakonderdeelplanning'
    // id: 170
    const appId = 3;
    let layerId = 16;
    let featTypeId = 170;
    const filter = 'wegvakonderdeel_id = "A0ABA09EB3F045AE80A293639EBEA701"';

    const metaParams: AttributeMetadataParameters = {
      application: appId,
      appLayer: layerId,
    };

    layerId = 16;
    featTypeId = 170;
    const params: AttributeListParameters = {
      application: appId,
      appLayer: layerId,
      featureType: featTypeId,
      dir: 'ASC',
      sort: '',
      filter,
    };

    attrService.featureTypeMetadata$(metaParams).subscribe(
      (metaData: AttributeMetadataResponse) => {
        console.log('====');
        console.log(metaData);
      },
      () => {
        console.log('Error!!!')
      },
    );
    attrService.features$(params).subscribe(
      (data: AttributeListResponse) => {
        console.log('---');
        console.log(data);
      },
      () => {
        console.log('Error!!!')
      },
    );
  }

  public static getData(layerName: string): RowData[] {
    if (AttributelistHelpers.sameText(layerName, 'Panden')) {
      return Test.getPanden();
    } else if (AttributelistHelpers.sameText(layerName, 'Bomen')) {
      return Test.getBomen();
    } else {
      return Test.getStraten();
    }
  }

  public static getData123(layerName: string): RowData[] {
    if (AttributelistHelpers.sameText(layerName, 'Panden')) {
      return Test.getBomen1();
    } else if (AttributelistHelpers.sameText(layerName, 'Bomen')) {
      return Test.getBomen2();
    } else {
      return Test.getBomen3();
    }
  }

  public static getBomen(): RowData[] {
    return [
      {
        naam: 'Acer',
        gemeente: 'Bennebroek',
        hoogte: 3307,
      },
      {
        naam: 'Prunus',
        gemeente: 'Deventer',
        hoogte: 12911,
      },
      {
        naam: 'Acer',
        gemeente: 'Rucphen',
        hoogte: 65,
      },
      {
        naam: 'Prunus',
        gemeente: 'Zoetermeer',
        hoogte: 4952,
      },
      {
        naam: 'Prunus',
        gemeente: 'Ubach over Worms',
        hoogte: 5512,
      },
    ];
  }

  public static getBomen1(): RowData[] {
    return [
      {
        naam: 'Acer',
        gemeente: 'Bennebroek',
        hoogte: 3307,
      },
    ];
  }

  public static getBomen2(): RowData[] {
    return [
      {
        naam: 'Prunus',
        gemeente: 'Deventer',
        hoogte: 12911,
      },
    ];
  }

  public static getBomen3(): RowData[] {
    return [
      {
        naam: 'Rosa',
        gemeente: 'Rucphen',
        hoogte: 65,
      },
    ];
  }

  public static getStraten(): RowData[] {
    return [
      {
        type: 'A1',
        gemeente: 'Bennebroek',
      },
      {
        type: 'E2',
        gemeente: 'Deventer',
      },
      {
        type: 'R3',
        gemeente: 'Rucphen',
      },
      {
        type: 'C4',
        gemeente: 'Zoetermeer',
      },
      {
        type: 'A5',
        gemeente: 'Ubach over Worms',
      },
      {
        type: 'C6',
        gemeente: 'Meerkerk',
      },
      {
        type: 'V7',
        gemeente: 'Apeldoorn',
      },
      {
        type: 'M8',
        gemeente: 'Vollenhove',
      },
      {
        type: 'H9',
        gemeente: 'Haarlem',
      },
      {
        type: 'D1',
        gemeente: 'Berg en Terblijt',
      }];
  }

  public static getPanden(): RowData[] {
    return [
      {
        sectie: 'A',
        kadastraleGemeenteWaarde: 'Bennebroek',
        perceelnummer: 3307,
      },
      {
        sectie: 'E',
        kadastraleGemeenteWaarde: 'Deventer',
        perceelnummer: 12911,
      },
      {
        sectie: 'R',
        kadastraleGemeenteWaarde: 'Rucphen',
        perceelnummer: 65,
      },
      {
        sectie: 'C',
        kadastraleGemeenteWaarde: 'Zoetermeer',
        perceelnummer: 4952,
      },
      {
        sectie: 'A',
        kadastraleGemeenteWaarde: 'Ubach over Worms',
        perceelnummer: 5512,
      },
      {
        sectie: 'C',
        kadastraleGemeenteWaarde: 'Meerkerk',
        perceelnummer: 992,
      },
      {
        sectie: 'V',
        kadastraleGemeenteWaarde: 'Apeldoorn',
        perceelnummer: 4155,
      },
      {
        sectie: 'M',
        kadastraleGemeenteWaarde: 'Vollenhove',
        perceelnummer: 77,
      },
      {
        sectie: 'H',
        kadastraleGemeenteWaarde: 'Haarlem',
        perceelnummer: 1324,
      },
      {
        sectie: 'D',
        kadastraleGemeenteWaarde: 'Berg en Terblijt',
        perceelnummer: 731,
      }];
  }

  public static getPassport(layerName: string): string[] {
    if (AttributelistHelpers.sameText(layerName, 'wegvakonderdeel')) {
      return Test.getPassportWegvakonderdeel();
    } else if (AttributelistHelpers.sameText(layerName, 'wegvakonderdeelplanning')) {
        return Test.getPassportWegvakonderdeelPlanning();
    } else if (AttributelistHelpers.sameText(layerName, 'Panden')) {
      return Test.getPassportPanden();
    } else if (AttributelistHelpers.sameText(layerName, 'Bomen')) {
      return Test.getPassportBomen();
    } else {
      return Test.getPassportStraten();
    }
  }

  public static getPassportWegvakonderdeel(): string[] {
    return ['buurt', 'wijk', 'woonplaats', 'verhardingsfunctie', 'verhardingssoort', 'aanzien'];
  }

  public static getPassportWegvakonderdeelPlanning(): string[] {
    return ['planstatus', 'frequentie', 'hoeveelheid', 'jaarvanuitvoering', 'kosten', 'maatregel_wvko', 'maatregeltype'];
  }

  public static getPassportBomen(): string[] {
    return ['gemeente', 'naam'];
  }

  public static getPassportStraten(): string[] {
    return ['gemeente'];
  }

  public static getPassportPanden(): string[] {
    return ['perceelnummer', 'sectie'];
  }
}
