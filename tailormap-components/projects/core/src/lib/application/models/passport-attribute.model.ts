import { Attribute } from '../../shared/attribute-service/attribute-models';

export interface PassportAttributeModel extends Attribute {
  passportAlias: string;
}
