import { LayerFilterValues } from './attributelist-filter-models';

export class AttributelistFilter {

  public layerFilterValues: LayerFilterValues = {
    layerId: 0,
    columns: [],
  };

  private valueFilter: string;

  /**
   * Create the CQL filter string
   */
  public createFilter(): string {
    this.valueFilter = '';
    let filteredColumns = 0;
    this.layerFilterValues.columns.forEach((c) => {
      if (c.status) {
        filteredColumns++;
        if (filteredColumns === 1) {
          this.valueFilter = ' ';
        } else {
          this.valueFilter += ' AND';
        }
        if (c.nullValue) {
          this.valueFilter += ' ' + c.name + ' IS NULL';
        } else {
          this.valueFilter += ' ' + c.name + ' IN (';
          let filteredValues = 0;
          let quote = '';
          c.uniqueValues.forEach((v) => {
            if (v.select) {
              filteredValues++;
              if (filteredValues === 1) {
                if (typeof(v.value) === 'string') {
                  quote = '\'';
                }
              } else {
                this.valueFilter += ',';
              }
              this.valueFilter += quote + v.value + quote;
            }
          })
          this.valueFilter += ')';
        }
      }
    })
    return this.valueFilter;
  }

}
