import { GeoJSONGeometry } from 'wellknown';
import { Geometry } from '../../shared/generated';
import { NoOpWorkflow } from './NoOpWorkflow';

export class WorkflowHelpers{

  public static findTopRight(geojson: GeoJSONGeometry): [number, number] {
      switch (geojson.type) {
        case 'MultiPolygon':
        case 'Polygon':
        case 'LineString':
        case 'MultiLineString':
          return geojson.coordinates[0] as [number, number];
        case 'MultiPoint':
        case 'Point':
          return geojson.coordinates as [number, number];
        default:
          return [0, 0];
    }
  }

  public static findTopRightGeometry(geojson: Geometry): [number, number] {
    return geojson.coordinates[0] as [number, number];
  }
}
