
import { Attribute } from '../../../shared/attribute-service/attribute-models';
import { AttributelistColumn, AttributelistColumnType } from '../models/attributelist-column-models'

export class AttributelistColumnController {

  // List of attributes as return from metadataGetColumns
  private attributes: Attribute[] = [];

  // List with special columns, needed for within this app.
  private specialColumns: AttributelistColumn[] = [];

  // List with all columns, based on the original data.
  private dataColumns: AttributelistColumn[] = [];

  // List with passport columns, i.e. selection of all columns.
  private passportColumns: AttributelistColumn[] = [];

  // List of active (i.e. visible) columns.
  private activeColumns: AttributelistColumn[] = [];

  // List of active (i.e. visible) column names.
  private activeColumnNames: string[] = [];

  // Passport flag.
  public isPassportActive = false;

  constructor() {
    // Fill the list with special column, add special column name '_checked'.
    let column: AttributelistColumn = {
      name: '_checked',
      visible: true,
      dataType: 'boolean',
      columnType: 'special',
    };
    this.specialColumns.push(column);
    column = {
      name: '_details',
      visible: true,
      dataType: 'boolean',
      columnType: 'special',
    };
    this.specialColumns.push(column);
  }

  /**
   * Returns the column with the specified column name.
   */
  public arrayIndexOfColumn(arr: AttributelistColumn[],
                            columnName: string): number {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].name === columnName) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Returns a list of IAttributeListColumn's from a list of colomn names.
   * All columns are visible by default.
   * The special column name '_checked' is skipped.
   */
  public columnNamesToColumns(columnNames: string[]): AttributelistColumn[] {
    const columns: AttributelistColumn[] = [];

    // Check the column names.
    if (columnNames.length === 0) {
      return columns;
    }
    // Add new columns.
    for (const columnName of columnNames) {
      if (columnName === '_checked') {
        // Skip.
        continue;
      }
      const column: AttributelistColumn = {
        name: columnName,
        visible: true,
        columnType: 'passport',
      };
      columns.push(column);
    }
    return columns;
  }

  public getPassPortColumnsAsColumns(): string[] {
    const columns = [];
    this.passportColumns.forEach((passportcolumn) => {
      columns.push(passportcolumn.name);
    });
    return columns;
  }

  public setAttributes (columnDefs: Attribute[]) {
    for (const columnDef of columnDefs) {
      this.attributes.push(columnDef);
    }
  }

  /**
   * Returns attribute object based on column name
   */
  public getAttributeForColumnName(columnName: string): Attribute {
    return this.attributes.find(c => c.name === columnName)
  }

  public columnDefsToColumns(columnDefs: Attribute[], columnType: AttributelistColumnType): AttributelistColumn[] {
    const columns: AttributelistColumn[] = [];
    // Add new columns.
    for (const columnDef of columnDefs) {
      if (columnDef.name === '_checked') {
        // Skip.
        continue;
      }
      const column: AttributelistColumn = {
        name: columnDef.name,
        visible: true,
        dataType: columnDef.type,
        columnType,
      };
      columns.push(column);
    }
    return columns;
  }

  /**
   * Returns a list of active passport columns or if no passport all columns.
   */
  public getActiveColumns(includeSpecial: boolean): AttributelistColumn[] {
    if (includeSpecial) {
      return [...this.specialColumns, ...this.activeColumns];

    } else {
      return this.activeColumns;
    }
  }

  /**
   * Returns a list of all columns (i.e. all data columns).
   */
  public getAllColumns(includeSpecial: boolean): AttributelistColumn[] {
    if (includeSpecial) {
      return [...this.specialColumns, ...this.dataColumns];
    } else {
      return this.dataColumns;
    }
  }

  public getColumnType(colName: string): string {
    const colIndex = this.arrayIndexOfColumn(this.dataColumns, colName)
    return this.dataColumns[colIndex].dataType;
  }

  /**
   * Returns a list of visible column names.
   * Is called in table.getColumnNames().
   */
  public getVisibleColumnNames(includeSpecial: boolean): string[] {
    const columns = this.getActiveColumns(includeSpecial);
    // Remove all column names.
    this.activeColumnNames.splice(0, this.activeColumnNames.length);
    // Add names of visible columns.
    for (const column of columns) {
      if (column.visible) {
        this.activeColumnNames.push(column.name);
      }
    }
    return this.activeColumnNames;
  }

  public hasDataColumns(): boolean {
    return (this.dataColumns.length > 0);
  }

  public hasPassportColumns(): boolean {
    return (this.passportColumns.length > 0);
  }

  /**
   * Activates all columns, i.e. sets all columns visible.
   */
  public setActiveAll(): void {
    // Update the active columns.
    this.isPassportActive = false;
    this.updateActiveColumns();
  }

  /**
   * Activates only the passport columns.
   */
  public setActivePassport(): void {
    // Update the active columns.
    this.isPassportActive = true;
    this.updateActiveColumns();
  }

  /**
   * Sets the data column names. The list could contain a special column
   * '_checked'. If so, this column is promoted to the first column of the list.
   */
  public setDataColumnNames(columnDefs: Attribute[]): void {
    // this.dataColumns = this.columnNamesToColumns(columnNames);
    this.dataColumns = this.columnDefsToColumns(columnDefs, 'data');
    // console.log('#AttColumns - setDataColumnNames');
    // console.log(this.dataColumns);

    // Udate the active columns.
    this.updateActiveColumns();
  }

  /**
   * Sets the passport column names.
   */
  public setPassportColumnNames(columnNames: string[]): void {
    if (columnNames.length === 0) {
      // Remove all columns.
      this.passportColumns.splice(0, this.passportColumns.length);
    } else {
      // Set passport columns.
      this.passportColumns = this.columnNamesToColumns(columnNames);
    }
    // Activate passport columns.
    this.setActivePassport();
  }

  /**
   * Udates the active columns.
   */
  private updateActiveColumns(): void {

    // Are there passport columns and is passport active?
    if ((this.passportColumns.length > 0) && (this.isPassportActive)) {
      // Remove all columns.
      this.activeColumns.splice(0, this.activeColumns.length);
      // Add all passport columns which are valid.
      for (const column of this.passportColumns) {
        // A valid column?
        if (this.arrayIndexOfColumn(this.dataColumns, column.name) >= 0) {
          this.activeColumns.push(column);
        }
      }
    } else {
      // No passport columns or passport not active?
      // Add data columns not already in the list.
      for (const column of this.dataColumns) {
        if (this.arrayIndexOfColumn(this.activeColumns, column.name) < 0) {
          this.activeColumns.push(column);
        }
      }
    }
  }

}
