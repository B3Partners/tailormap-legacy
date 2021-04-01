import { Attribute } from '../../shared/attribute-service/attribute-models';

export interface ExtendedAttributeModel extends Attribute {
  alias: string;
}
