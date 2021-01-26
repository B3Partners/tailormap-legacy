export class FormHelpers {

  public static capitalize(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  public static snakecaseToCamel(s: string): string {
    return s.replace(/([-_][a-z])/ig, ($1) => {
      return $1.toUpperCase()
        .replace('-', '')
        .replace('_', '');
    });
  }
}
