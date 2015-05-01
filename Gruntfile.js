module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! \n' + '* Author: Graham Dixon \n' + '* Contact: gdixon@assetinfo.co.uk \n' + '* Copyright: (c) 2015 Graham Dixon (assetinfo(MML))\n' + '* Script: jquery.gridsplit.min.js - v.0.0.1 \n' + '* Licensed: MIT \n' + '* Depends on: jQuery && jQuery-ui-draggable, bootstrap 3.*\n' + '*/\n'
            },
            min: {
                options: {
                    beautify: false,
                    mangle: true
                },
                files: {
                    'dist/jquery.gridsplit.min.js': ['src/js/jquery.gridsplit.js']
                }
            },
            dist: {
                options: {
                    beautify: true,
                    mangle: false
                },
                files: {
                    'dist/jquery.gridsplit.js': ['src/js/jquery.gridsplit.js']
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: "",
                    name: "src/js/jquery.gridsplit",
                    mainConfigFile: "config.js",
                    out: "dist/jquery.gridsplit.optimised.js"
                }
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'dist/jquery.gridsplit.optimised.css': ['./bower_components/bootstrap/dist/css/bootstrap.css', './src/css/jquery.gridsplit.css']
                }
            }
        },
        jsdoc: {
            dist: {
                src: ['src/js/*.js', 'README.md'],
                options: {
                    destination: 'docs',
                    configure: './docsConf.json',
                    template: './node_modules/jsdoc-oblivion/template'
                }
            }
        },
        jasmine: {
            full: {
                src: "dist/jquery.gridsplit.optimised.js",
                options: {
                    specs: "spec/*[S|s]pec.js",
                    vendor: ["spec/lib/matchers.js", "spec/lib/jasmine-species/jasmine-grammar.js", "spec/lib/setup.js"]
                }
            }
        }
    });
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // Load the plugin that optimises AMD loads.
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    // Load the plugin that optimises CSS.
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-jsdoc');
    // Default task(s).
    grunt.registerTask('default', ['uglify', 'requirejs', 'cssmin', 'jsdoc']);
    // Load the plugin that provides testing.
    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('docs', ['jsdoc']);
};