module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    svgstore: {
        options: {
          prefix : 'icon-', // This will prefix each ID
          svg: {
            viewBox : '0 0 100 100',
            xmlns: 'http://www.w3.org/2000/svg'
          },
          includeTitleElement: false
        },
        default : {
            files: {
              'sprite.svg': ['svg/*.svg']
            }
        }
      }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-svgstore');

  // Default task(s).
  grunt.registerTask('default', ['svgstore']);
};