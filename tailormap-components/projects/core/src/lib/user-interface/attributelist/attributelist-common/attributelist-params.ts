
export class AttributelistParams {
  public layerName = '';
  public layerId = -1;
  public parentId = -1;
  // public pageSize = 10;
  // public pageIndex = 0;
  public filter? = '';
  public columnNames: string[] = [];    // The columns to get from the server.
}
