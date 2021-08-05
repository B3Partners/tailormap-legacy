const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');
const packageJsonOverrides = require('../projects/third-party-components/third-party-components-package-json-overrides.json');

const merge = (...arguments) => {
  // create a new object
  let target = {};
  // deep merge the object into the target object
  const merger = (obj) => {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          // if the property is a nested object
          target[prop] = merge(target[prop], obj[prop]);
        } else {
          // for regular property
          target[prop] = obj[prop];
        }
      }
    }
  };
  // iterate through all objects and
  // deep merge them with target
  for (let i = 0; i < arguments.length; i++) {
    merger(arguments[i]);
  }
  return target;
};

const updatedPackageJson = merge({}, packageJson, packageJsonOverrides);

fs.writeFile(path.resolve(__dirname, '../package.json'), JSON.stringify(updatedPackageJson, null, 2), function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log('Dependencies merged in package.json');
  }
});
