module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '// Author: Graham Dixon \n'+
                '// Contact: gdixon@assetinfo.co.uk \n'+
                '// Copyright: (c) 2015 Graham Dixon (assetinfo(MML))\n'+
                '// Script: jquery.gridsplit.min.js - v.0.0.1 \n'+
                '// Licensed: MIT \n'+
                '// Depends on: jQuery && jQuery-ui, underscore, bootstrap 3.*'
      },
      min: {
        options: {
          beautify: false,
          mangle: true
        },
        files: {
          'dist/jquery.<%= pkg.name %>.min.js': ['src/js/jquery.<%= pkg.name %>.js']
        }
      }
    },
    jasmine: {
      full: {
        src: "src/**/*.js",
        options: {
          specs: "spec/*[S|s]pec.js",
          vendor: [
            "spec/lib/matchers.js",
            "spec/lib/jasmine-species/jasmine-grammar.js",
            "spec/lib/setup.js",
            "bower_components/jquery/dist/jquery.js",
            "bower_components/underscore/underscore.js"
          ]
        }
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Default task(s).
  grunt.registerTask('default', ['uglify']);

  // Load the plugin that provides testing.
  grunt.loadNpmTasks("grunt-contrib-jasmine");
  grunt.registerTask('test', ['jasmine']);

};