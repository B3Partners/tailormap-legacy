var path = require('path');

module.exports = {
  "extends": path.resolve(__dirname, "../../.eslintrc.json"),
  "ignorePatterns": [
    "!**/*"
  ],
  "overrides": [
    {
      "files": [
        "*.ts"
      ],
      "parserOptions": {
        "project": [
          "tsconfig.app.json",
          "tsconfig.spec.json",
          "e2e/tsconfig.json"
        ],
        "createDefaultProgram": true,
        "tsconfigRootDir": __dirname
      },
      "rules": {}
    },
    {
      "files": [
        "*.html"
      ],
      "rules": {}
    }
  ]
};
