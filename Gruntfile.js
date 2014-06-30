/*
 * json-difference-finder
 * 
 *
 * Copyright (c) 2014 Dominik Michalski
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= mochaTest.test.src %>'
            ],
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            }
        },

        jsonStructureComparator: {
            options: {
                pathDelimiter: "."
            },
            default: {
                'src': ['test/fixtures/first.json', 'test/fixtures/third.json']
            },
            failing: {
                'src': ['test/fixtures/*.json']
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/**/*.js']
            }
        }

    });

    grunt.loadTasks('tasks');
    grunt.registerTask('komoot', ['json_difference_finder']);
    grunt.registerTask('default', ['jshint', 'mochaTest']);

};
