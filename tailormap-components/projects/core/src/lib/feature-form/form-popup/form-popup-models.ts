import {
  Feature,
  Geometry,
} from '../../shared/generated';



export interface DialogData {
  formFeatures: Feature[];
  isBulk: boolean;
  lookup: Map<string, string>;
}

export interface DialogClosedData {
  iets: string;
}

export interface HighlightData {
  geojson: Geometry;
}

export interface GeometryInteractionData {
  type: GeometryType;

}

export enum GeometryType {
  POLYGON = 'Polygon',
  LINESTRING = 'LineString',
  POINT = 'Point',
}
