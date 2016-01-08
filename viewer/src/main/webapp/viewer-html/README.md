# Sprite generation
To generate a SVG sprite file, make sure NodeJS is installed.
First requirement is to install the Grunt client:

    npm install grunt-cli -g

If this is the first time a sprite is generated you first need to run

    npm install

After this command is completed the grunt task can be executed, simply run

    grunt

This command combines all the SVG files in the svg folder to sprite.svg