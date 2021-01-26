export const getEventValue = <E extends Event>(e: E, key: keyof E) => {
  const testkey = `test${key}`;
  if (e.hasOwnProperty(testkey)) { // When testing in IE11 only custom properties are allowed so we prefix all properties with test
    return e[testkey];
  }
  return e[key];
};
