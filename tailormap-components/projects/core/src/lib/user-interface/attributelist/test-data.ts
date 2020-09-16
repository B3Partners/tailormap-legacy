/**============================================================================
 * Test data voor panden, straten en bomen.
 *===========================================================================*/

import {Utils} from './utils';

export class TestData {

  /**----------------------------------------------------------------------------
   */
  public static getData(layerName: string): any[] {
    if (Utils.sameText(layerName, "Panden")) {
      return TestData.getPanden();
    } else if (Utils.sameText(layerName, "Bomen")) {
      return TestData.getBomen();
    } else {
      return TestData.getStraten();
    }
  }
  /**----------------------------------------------------------------------------
   */
  public static getData123(layerName: string): any[] {
    if (Utils.sameText(layerName, "Panden")) {
      return TestData.getBomen1();
    } else if (Utils.sameText(layerName, "Bomen")) {
      return TestData.getBomen2();
    } else {
      return TestData.getBomen3();
    }
  }
  /**----------------------------------------------------------------------------
   */
  public static getBomen(): any[] {
    return [
      {
        naam: "Acer",
        gemeente: "Bennebroek",
        hoogte: 3307
      },
      {
        naam: "Prunus",
        gemeente: "Deventer",
        hoogte: 12911
      },
      {
        naam: "Acer",
        gemeente: "Rucphen",
        hoogte: 65
      },
      {
        naam: "Prunus",
        gemeente: "Zoetermeer",
        hoogte: 4952
      },
      {
        naam: "Prunus",
        gemeente: "Ubach over Worms",
        hoogte: 5512
      }
    ];
  }
  /**----------------------------------------------------------------------------
   */
  public static getBomen1(): any[] {
    return [
      {
        naam: "Acer",
        gemeente: "Bennebroek",
        hoogte: 3307
      },
    ];
  }
  /**----------------------------------------------------------------------------
   */
  public static getBomen2(): any[] {
    return [
      {
        naam: "Prunus",
        gemeente: "Deventer",
        hoogte: 12911
      },
    ];
  }
  /**----------------------------------------------------------------------------
   */
  public static getBomen3(): any[] {
    return [
      {
        naam: "Rosa",
        gemeente: "Rucphen",
        hoogte: 65
      },
    ];
  }
  /**----------------------------------------------------------------------------
   */
  public static getStraten(): any[] {
    return [{
      type: "A1",
      gemeente: "Bennebroek"
    },
    {
      type: "E2",
      gemeente: "Deventer"
    },
    {
      type: "R3",
      gemeente: "Rucphen"
    },
    {
      type: "C4",
      gemeente: "Zoetermeer"
    },
    {
      type: "A5",
      gemeente: "Ubach over Worms"
    },
    {
      type: "C6",
      gemeente: "Meerkerk"
    },
    {
      type: "V7",
      gemeente: "Apeldoorn"
    },
    {
      type: "M8",
      gemeente: "Vollenhove"
    },
    {
      type: "H9",
      gemeente: "Haarlem"
    },
    {
      type: "D1",
      gemeente: "Berg en Terblijt"
    }];
  }
  /**----------------------------------------------------------------------------
   */
  public static getPanden(): any[] {
    return [
      {
        sectie: 'A',
        kadastraleGemeenteWaarde: 'Bennebroek',
        perceelnummer: 3307
      },
      {
        sectie: 'E',
        kadastraleGemeenteWaarde: 'Deventer',
        perceelnummer: 12911
      },
      {
        sectie: 'R',
        kadastraleGemeenteWaarde: 'Rucphen',
        perceelnummer: 65
      },
      {
        sectie: 'C',
        kadastraleGemeenteWaarde: 'Zoetermeer',
        perceelnummer: 4952
      },
      {
        sectie: 'A',
        kadastraleGemeenteWaarde: 'Ubach over Worms',
        perceelnummer: 5512
      },
      {
        sectie: 'C',
        kadastraleGemeenteWaarde: 'Meerkerk',
        perceelnummer: 992
      },
      {
        sectie: 'V',
        kadastraleGemeenteWaarde: 'Apeldoorn',
        perceelnummer: 4155
      },
      {
        sectie: 'M',
        kadastraleGemeenteWaarde: 'Vollenhove',
        perceelnummer: 77
      },
      {
        sectie: 'H',
        kadastraleGemeenteWaarde: 'Haarlem',
        perceelnummer: 1324
      },
      {
        sectie: 'D',
        kadastraleGemeenteWaarde: 'Berg en Terblijt',
        perceelnummer: 731
      }];
  }
  /**----------------------------------------------------------------------------
   */
  public static getPassport(layerName: string): string[] {
    if (Utils.sameText(layerName, "Panden")) {
      return TestData.getPassportPanden();
    } else if (Utils.sameText(layerName, "Bomen")) {
      return TestData.getPassportBomen();
    } else {
      return TestData.getPassportStraten();
    }
  }
  /**----------------------------------------------------------------------------
   */
  public static getPassportBomen(): string[] {
    return ["gemeente", "naam"];
  }
  /**----------------------------------------------------------------------------
   */
  public static getPassportStraten(): string[] {
    return ["gemeente"];
  }
  /**----------------------------------------------------------------------------
   */
  public static getPassportPanden(): string[] {
    return ["perceelnummer", "sectie"];
  }
}

