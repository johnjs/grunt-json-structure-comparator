/*
 * json-structure-comparator
 * 
 *
 * Copyright (c) 2014 Dominik Michalski
 * Licensed under the MIT license.
 */

'use strict';

var jsonComparator = require("./lib/ObjectsStuctureComparator");

module.exports = function (grunt) {

    grunt.registerMultiTask('jsonStructureComparator', 'Compares JSON files and returns a list of keys missing in these files', function () {

        var options = this.options({
            pathDelimiter: "->"
        });

        this.files.forEach(function (file) {
            var src = file.src.filter(function (filepath) {
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function (filepath) {
                return {
                    'id': filepath,
                    'value': grunt.file.readJSON(filepath)
                };
            });

            var results = jsonComparator.compareObjects(src, options.pathDelimiter);

            if (Object.keys(results).length > 0) {
                grunt.fail.fatal("Files has different structures. Please check following keys:" + JSON.stringify(results));
            }
        });

    });

};
