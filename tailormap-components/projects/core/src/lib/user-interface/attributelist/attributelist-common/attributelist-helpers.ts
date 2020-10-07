/**
 * Bare typescript utilities (no additional libs are required).
 */

export class AttributelistHelpers {

  /**
   * Returns only the original column names. Special column names (i.e. _*) are
   * skipped.
   */
  public static arrayFilterColumnNames(arr: string[]): string[] {
    return arr.filter( (name: string) => !name.startsWith('_') );
  }

  /**
   * Returns the page with index from an array.
   * The first page has index 0.
   */
  public static arrayGetPage(arr: any[], pageIndex: number, pageSize: number): any[] {
    return arr.slice((pageIndex * pageSize), ((pageIndex + 1) * pageSize));
  }

  /**
   * Sorts an array on the specified colomn name (i.e. property).
   * @param   arr - The input array.
   * @param   columnName - Column name.
   * @param   sortOrder - 'asc' or 'desc'.
   * @returns Array of any.
   */
  public static arraySortOnColumnName(arr: any[], columnName: string,
                                      sortOrder: string = 'asc'): any[] {
    const newArr = [...arr];
    newArr.sort((n1, n2) => {
      if (n1[columnName] > n2[columnName]) {
        return 1;
      }
      if (n1[columnName] < n2[columnName]) {
        return -1;
      }
      return 0;
    });
    if (AttributelistHelpers.sameText(sortOrder, 'desc')) {
      newArr.reverse();
    }
    return newArr;
  }

  /**
   * Moves an element within an array to place with the specified index.
   */
  public static arraySetElementIndex(arr: any[], element: string, index: number): void {
    const n = arr.indexOf(element);
    if (n < 0) {
      return;
    }
    arr.splice(n, 1);
    arr.splice(index, 0, element);
  }

  /**
   * Add a column/property to all objects in an array (rows) and sets its
   * initial value.
   */
  public static rowsAddColumn(rows: any[], columnName: string, initialValue: any): any[] {
    const newRows = [...rows];
    for (const row of newRows) {
      row[columnName] = initialValue;
    }
    return newRows;
  }

  /**
   * Returns a list of column names from an array of objects (rows), i.e.
   * {a: v1, b: v2, ...}. Returns ['a','b',...].
   * To get the column names only the first row is used.
   * Returns [] when there are no rows.
   */
  public static rowsGetColumnNames(rows: any[]): string[] {
    // Check the rows.
    if (rows.length === 0) {
      return [];
    }
    // Get the column names.
    return Object.getOwnPropertyNames(rows[0]);
  }

  /**
   * Returns if 2 string are equal (case insensitive).
   */
  public static sameText(s1: string, s2: string): boolean {
    return (s1.toUpperCase() === s2.toUpperCase());
  }
}
