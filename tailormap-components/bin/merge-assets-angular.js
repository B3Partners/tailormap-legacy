const fs = require('fs');
const assets = require('../projects/third-party-components/third-party-components-assets.json');
const angular = require('../angular.json');

function mergeAssets(angularAssets) {
  assets.forEach(asset => {
    if (angularAssets.findIndex(a => a.input === asset.input) === -1) {
      angularAssets.push(asset);
    }
  });
}

function addAssets(project, step) {
  if (project.architect[step] && project.architect[step].options && project.architect[step].options.assets) {
    mergeAssets(project.architect[step].options.assets);
  }
}

for (const project in angular.projects) if(angular.projects.hasOwnProperty(project)) {
  if (angular.projects[project].architect) {
    addAssets(angular.projects[project], 'build');
    addAssets(angular.projects[project], 'test');
  }
}

fs.writeFile('../angular.json', JSON.stringify(angular, null, 2), function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log('JSON saved to angular.json');
  }
});
