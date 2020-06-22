import {Feature} from "../../shared/generated";

import {FormConfigurations} from "../form/form-models";

export interface DialogData {
  formFeatures: Feature[];
  formConfigs: FormConfigurations;
  isBulk: boolean;
  lookup: Map<string, string>;
}

export interface DialogClosedData {
  iets: string;
}

export interface GeometryInteractionData {
  type: GeometryType;

}

export enum GeometryType {
  POLYGON = "Polygon",
  LINESTRING = "LineString",
  POINT = "Point",
}
