/**============================================================================
 *===========================================================================*/

/**----------------------------------------------------------------------------
 */
export interface IAttributeListColumn {
  // Column name.
  name: string;
  // Visible in the table.
  visible: boolean;
}

/**----------------------------------------------------------------------------
 */
export class AttributelistColumnController {

  // List with special columns, needed for within this app.
  specialColumns: IAttributeListColumn[] = [];

  // List with all columns, based on the original data.
  dataColumns: IAttributeListColumn[] = [];

  // List with passport columns, i.e. selection of all columns.
  passportColumns: IAttributeListColumn[] = [];

  // List of active (i.e. visible) columns.
  activeColumns: IAttributeListColumn[] = [];

  // Passport flag.
  isPassportActive = false;

  /**----------------------------------------------------------------------------
   */
  constructor() {
    // Fill the list with special column, add special column name "_checked".
    const column: IAttributeListColumn = {
      name: "_checked",
      visible: true
    };
    this.specialColumns.push(column);
  }
  /**----------------------------------------------------------------------------
   * Returns the column with the specified column name.
   */
  arrayIndexOfColumn(arr: IAttributeListColumn[],
                     columnName: string): number {
    for (let i=0; i < arr.length; i++) {
      if (arr[i].name === columnName) {
        return i;
      }
    }
    return -1;
  }
  /**----------------------------------------------------------------------------
   * Returns a list of IAttributeListColumn's from a list of colomn names.
   * All columns are visible by default.
   * The special column name "_checked" is skipped.
   */
  columnNamesToColumns(columnNames: string[]): IAttributeListColumn[] {
    // Check the column names.
    if (columnNames.length === 0) {
      return;
    }
    const columns: IAttributeListColumn[] = [];
    // Add new columns.
    for (const columnName of columnNames) {
      if (columnName === "_checked") {
        // Skip.
        continue;
      }
      const column: IAttributeListColumn = {
        name: columnName,
        visible: true
      };
      columns.push(column);
    }
    return columns;
  }
  /**----------------------------------------------------------------------------
   * Returns a list of active (i.e. visible) columns.
   */
  getActiveColumns(includeSpecial: boolean): IAttributeListColumn[] {
    if (includeSpecial) {
      return [...this.specialColumns, ...this.activeColumns];

    } else {
      return this.activeColumns;
    }
  }
  /**----------------------------------------------------------------------------
   * Returns a list of active (i.e. visible) column names.
   */
  getActiveColumnNames(includeSpecial: boolean): string[] {
    let columns: IAttributeListColumn[];
    const names: string[] = [];
    if (includeSpecial) {
      columns = [...this.specialColumns, ...this.activeColumns];
    } else {
      columns = this.activeColumns;
    }
    // console.log("#AttColumns - getActiveNames");
    // console.log(columns);
    for (const column of columns) {
      if (column.visible) {
        names.push(column.name);
      }
    }
    return names;
  }
  /**----------------------------------------------------------------------------
   * Returns a list of all columns.
   */
  getAllColumns(includeSpecial: boolean): IAttributeListColumn[] {
    if (includeSpecial) {
      return [...this.specialColumns, ...this.dataColumns];
    } else {
      return this.dataColumns;
    }
  }
  /**----------------------------------------------------------------------------
   */
  hasDataColumns(): boolean {
    return (this.dataColumns.length > 0);
  }
  /**----------------------------------------------------------------------------
   */
  hasPassportColumns(): boolean {
    return (this.passportColumns.length > 0);
  }
  /**----------------------------------------------------------------------------
   * Activates all columns, i.e. sets all columns visible.
   */
  setActiveAll(): void {
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
  /**----------------------------------------------------------------------------
   */
  setActivePassport(): void {
    if (this.isPassportActive) {
      return;
    }
    // "Empty"?
    if (this.activeColumns.length === 0) {
      // Add.
      for (const column of this.passportColumns) {
        this.activeColumns.push(column);
      }
    } else {
      const newColumns: IAttributeListColumn[] = [];
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

    //console.log("#AttColumns - setActivePassport");
    //console.log(this.activeColumns);

    this.isPassportActive = true;
  }
  /**----------------------------------------------------------------------------
   * Sets the data column names. The list could contain a special column
   * "_checked". If so, this column is promoted to the first column of the list.
   */
  setDataColumnNames(columnNames: string[]): void {
    this.dataColumns = this.columnNamesToColumns(columnNames);
    //console.log("#AttColumns - setDataColumnNames");
    //console.log(this.dataColumns);
  }
  /**----------------------------------------------------------------------------
   * Sets the passport column names.
   */
  setPassportColumnNames(columnNames: string[]): void {
    this.passportColumns = this.columnNamesToColumns(columnNames);

    //console.log("#AttColumns - setPassportColumnNames");
    //console.log(this.passportColumns);

    // Set as active.
    this.setActivePassport();
  }
}
