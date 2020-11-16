
import { Attribute } from '../../test-attributeservice/models';
import { AttributelistColumn } from './attributelist-column-models'

export class AttributelistColumnController {

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
  private isPassportActive = false;

  constructor() {
    // Fill the list with special column, add special column name '_checked'.
    let column: AttributelistColumn = {
      name: '_checked',
      visible: true,
      type: 'boolean',
    };
    this.specialColumns.push(column);
    column = {
      name: '_details',
      visible: true,
      type: 'boolean',
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
    // Check the column names.
    if (columnNames.length === 0) {
      return;
    }
    const columns: AttributelistColumn[] = [];
    // Add new columns.
    for (const columnName of columnNames) {
      if (columnName === '_checked') {
        // Skip.
        continue;
      }
      const column: AttributelistColumn = {
        name: columnName,
        visible: true,
      };
      columns.push(column);
    }
    return columns;
  }
  public columnDefsToColumns(columnDefs: Attribute[]): AttributelistColumn[] {
    // Check the columns.
    if (columnDefs.length === 0) {
      return;
    }
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
        type: columnDef.type,
      };
      columns.push(column);
    }
    return columns;
  }

  /**
   * Returns a list of active (i.e. visible) columns.
   */
  public getActiveColumns(includeSpecial: boolean): AttributelistColumn[] {
    if (includeSpecial) {
      return [...this.specialColumns, ...this.activeColumns];

    } else {
      return this.activeColumns;
    }
  }

  /**
   * Returns a list of active (i.e. visible) column names.
   */
  public getActiveColumnNames(includeSpecial: boolean): string[] {
    const columns = this.getActiveColumns(includeSpecial);
    // Remove all names.
    this.activeColumnNames.splice(0, this.activeColumnNames.length);
    // Add active names.
    for (const column of columns) {
      if (column.visible) {
        this.activeColumnNames.push(column.name);
      }
    }
    return this.activeColumnNames;
  }

  /**
   * Returns a list of all columns.
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
    return this.dataColumns[colIndex].type;
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
    if (!this.isPassportActive) {
      return;
    }
    // Add not existing columns.
    for (const column of this.dataColumns) {
      if (this.arrayIndexOfColumn(this.activeColumns, column.name) < 0) {
        this.activeColumns.push(column);
      }
    }
    this.isPassportActive = false;
  }

  public setActivePassport(): void {
    if (this.isPassportActive) {
      return;
    }
    // 'Empty'?
    if (this.activeColumns.length === 0) {
      // Add.
      for (const column of this.passportColumns) {
        this.activeColumns.push(column);
      }
    } else {
      const newColumns: AttributelistColumn[] = [];
      // Remove not existing active columns.
      for (const column of this.activeColumns) {
        const index = this.arrayIndexOfColumn(this.passportColumns, column.name);
        // Found in passport columns?
        if (index >= 0) {
          // Copy.
          newColumns.push(column);
        }
      }
      this.activeColumns = newColumns;
    }

    // console.log('#AttColumns - setActivePassport');
    // console.log(this.activeColumns);

    this.isPassportActive = true;
  }

  /**
   * Sets the data column names. The list could contain a special column
   * '_checked'. If so, this column is promoted to the first column of the list.
   */
  public setDataColumnNames(columnDefs: Attribute[]): void {
    // this.dataColumns = this.columnNamesToColumns(columnNames);
    this.dataColumns = this.columnDefsToColumns(columnDefs);
    // console.log('#AttColumns - setDataColumnNames');
    // console.log(this.dataColumns);
  }

  /**
   * Sets the passport column names.
   */
  public setPassportColumnNames(columnNames: string[]): void {
    this.passportColumns = this.columnNamesToColumns(columnNames);
    // console.log('#AttColumns - setPassportColumnNames');
    // console.log(this.passportColumns);

    // Set as active.
    this.setActivePassport();
  }
}
