var _ = require('underscore');

module.exports = {
    /*
     * :param location: string. Directory containing json files.
     * :param inputFiles: array of strings. File names.
     * :param pathDelimiter: string. Delimiter for concatenating paths to the missing keys.
     *
     * :return object containing array of missing keys per name of the file
     * */
    compareFiles: function (location, inputFiles, pathDelimiter) {
        var inputObjects = inputFiles.map(function (file) {
            return {
                id: file,
                value: require(location + file + ".json")
            };
        });

        return this.compareObjects(inputObjects, pathDelimiter);
    },

    /*
     * :param objectList: array of objects. Array containing objects which should be compared.
     * :param pathDelimiter: string. Delimiter for concatenating paths to the missing keys.
     *
     * :return object containing array of missing keys per object id
     * */
    compareObjects: function (objectsList, pathDelimiter) {
        var results = this._compareAndGetMissingKeys(objectsList);
        return _.reduce(results, function (report, missingKeys, id) {
            if (missingKeys.length > 0) {
                report[id] = _.uniq(missingKeys.map(function (lackingKeyWithPath) {
                    return lackingKeyWithPath.join(pathDelimiter);
                }));
            }

            return report;
        }, {});
    },

    /*
     * :param objectList: array of objects. Array containing objects which should be compared. Each of them contains id and value.
     *
     * :return object containing array of missing keys per object id
     * */
    _compareAndGetMissingKeys: function (objectsList) {
        var results = this._prepareResultsContainer(objectsList);
        var that = this;
        objectsList.forEach(function (firstObj, firstObjIndex) {
            objectsList.slice(firstObjIndex).forEach(function (secondObj) {
                var differences = that._getStructureDifferences(firstObj.value, secondObj.value);

                results[firstObj.id] = results[firstObj.id].concat(differences[0]);
                results[secondObj.id] = results[secondObj.id].concat(differences[1]);
            });
        });

        return results;
    },

    /*
     * :param keysA: array of strings
     * :param keysB: array of strings
     *
     * :return array containing keys from keysA missing in keysB concatenated with path
     * */
    _getDifferenceBetweenKeysSets: function (keysA, keysB, pathToKeys) {
        return _.difference(keysA, keysB).map(function (lackingKey) {
            return pathToKeys.concat([lackingKey]);
        });
    },

    /*
     * :param object: object
     * :param currentPath: array of strings
     *
     * :return array containing all keys from object concatenated with path
     * */
    _getKeysWithPath: function (object, path) {
        return  _.keys(object).map(function (k) {
            return path.concat(k);
        });
    },

    /*
     * :param firstObj: object
     * :param secondObj: object
     * :param currentPathToKeys: array of strings
     *
     * :return array containing missing keys in
     *
     * Function compares structure of two objects. For the shared keys whose values are also objects it runs itself recursively.
     * */
    _getStructureDifferences: function (firstObj, secondObj, currentPathToKeys) {
        var keysOfFirstObj = _.keys(firstObj);
        var keysOfSecondObj = _.keys(secondObj);

        currentPathToKeys = currentPathToKeys || [];

        var keysMissingInFirstObj = this._getDifferenceBetweenKeysSets(keysOfSecondObj, keysOfFirstObj, currentPathToKeys);
        var keysMissingInSecondObj = this._getDifferenceBetweenKeysSets(keysOfFirstObj, keysOfSecondObj, currentPathToKeys);

        var that = this;

        _.intersection(keysOfFirstObj, keysOfSecondObj).forEach(function (key) {

            var valueFromFirstObj = firstObj[key];
            var valueFromSecondObj = secondObj[key];
            var newCurrentPath = currentPathToKeys.concat([key]);

            var firstValueIsObj = _.isObject(valueFromFirstObj);
            var secondValueIsObj = _.isObject(valueFromSecondObj);

            var difference = [
                [],
                []
            ];

            if (firstValueIsObj && secondValueIsObj) {
                difference = that._getStructureDifferences(valueFromFirstObj, valueFromSecondObj, newCurrentPath);
            } else if (firstValueIsObj != secondValueIsObj) {
                difference = that._handleDifferenceBetweenObjectsWithDifferentTypes(valueFromFirstObj, valueFromSecondObj, newCurrentPath);
            }

            keysMissingInFirstObj = keysMissingInFirstObj.concat(difference[0]);
            keysMissingInSecondObj = keysMissingInSecondObj.concat(difference[1]);

        });

        return [keysMissingInFirstObj, keysMissingInSecondObj];
    },

    /*
     * :param firstObject: object. First object to compare.
     * :param secondObject: object. Second object to compare.
     *
     * :return array with two elements - arrays of missing keys for firstObject and secondObject
     *
     * Function returns a difference in structure for two objects if only one of them is an object
     * */
    _handleDifferenceBetweenObjectsWithDifferentTypes: function (firstObject, secondObject, pathToObjects) {
        if (_.isObject(firstObject)) {
            return [
                [],
                this._getKeysWithPath(firstObject, pathToObjects)
            ];
        }
        return [this._getKeysWithPath(secondObject, pathToObjects), [] ];
    },
    /*
     * :param objectList: array of objects. Objects with id and value keys.
     *
     * :return object containing an empty array for every object from objectsList (per its key)
     *
     * Results object will contain missing keys for each of compared files.
     * */
    _prepareResultsContainer: function (objectsList) {
        return objectsList.reduce(function (results, object) {
            results[object.id] = [];
            return results;
        }, {});
    }
};