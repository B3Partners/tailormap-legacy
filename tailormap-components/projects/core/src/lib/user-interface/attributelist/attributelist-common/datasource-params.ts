
export class DatasourceParams {

  public layerId = -1;
  public layerName = '';
  // Use for getting layer detail info.
  public featureTypeId = -1;
  public featureTypeName = '';
  public featureFilter = '';

  /**
   * Returns if the params are for getting data a detail table.
   */
  public hasDetail(): boolean {
    return (this.featureTypeName !== '');
  }
}
