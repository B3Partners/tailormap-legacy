import { FormHelpers } from './form-helpers';

fdescribe('FormHelpers', () => {

  it('should capitalize', () => {
    expect(FormHelpers.capitalize("hallo")).toBe("Hallo");
  });

  it('should capitalize and empty string', () => {
    expect(FormHelpers.capitalize("")).toBe("");
  });

  it('should capitalize a string of length 1', () => {
    expect(FormHelpers.capitalize("h")).toBe("H");
  });
});
